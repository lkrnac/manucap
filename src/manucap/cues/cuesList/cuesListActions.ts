import "video.js";
import { Dispatch } from "react";
import { createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import {
    CueCategory,
    CueComment,
    CueDto,
    CueDtoWithIndex,
    CueError,
    CueLineDto,
    CuesWithRowIndex,
    GlossaryMatchDto,
    ScrollPosition,
    SpellcheckerSettings,
    SubtitleEditAction,
    Track
} from "../../model";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { constructCueValuesArray, copyNonConstructorProperties } from "../cueUtils";
import {
    applyInvalidChunkRangePreventionEnd,
    applyInvalidChunkRangePreventionStart,
    applyInvalidRangePreventionEnd,
    applyInvalidRangePreventionStart,
    applyOverlapPreventionEnd,
    applyOverlapPreventionStart,
    conformToRules,
    conformToSpelling,
    getTimeGapLimits,
    verifyCueDuration
} from "../cueVerifications";
import { changeScrollPosition } from "./cuesListScrollSlice";
import { addSpellCheck, fetchSpellCheck } from "../spellCheck/spellCheckFetch";
import {
    editingCueIndexSlice,
    focusedInputSlice,
    lastCueChangeSlice,
    validationErrorSlice
} from "../edit/cueEditorSlices";
import _ from "lodash";
import { rowsToMergeSlice } from "../merge/mergeSlices";
import {
    CueErrorsPayload,
    cuesSlice,
    matchedCuesSlice,
    ShiftPosition,
    SpellCheckRemovalAction
} from "./cuesListSlices";
import { callSaveTrack } from "../saveSlices";
import { callSaveCueUpdate } from "../saveCueUpdateSlices";
import { callSaveCueDelete } from "../saveCueDeleteSlices";

const NEW_ADDED_CUE_DEFAULT_STEP = 3;
const DEFAULT_CUE = { vttCue: new VTTCue(0, 0, ""), cueCategory: "DIALOGUE" };

interface MatchedCueIndexes {
    targetCuesIndex: number;
    editingIndexMatchedCues: number;
}

const findMatchedIndexes = (state: SubtitleEditState, index: number): MatchedCueIndexes => {
    // TODO: Remove following ugly code when we implement
    //  https://dotsub.atlassian.net/browse/VTMS-3304
    let targetCuesIndex = 0;
    const editingIndexMatchedCues = state.matchedCues.matchedCues.findIndex(
        (cueLineDto: CueLineDto): boolean => cueLineDto.targetCues
            ? cueLineDto.targetCues?.some(
                (targetCue, nestedIndex) => {
                    targetCuesIndex = nestedIndex;
                    return targetCue.index === index;
                }
            )
            : false
    );
    return { targetCuesIndex, editingIndexMatchedCues };
};

const shouldBlink = (x: VTTCue, y: VTTCue): boolean => {
    return JSON.stringify(constructCueValuesArray(x)) !== JSON.stringify(constructCueValuesArray(y));
};

const createAndAddCue = (previousCue: CueDto, startTime: number, endTime: number): CueDto => {
    const newCue = new VTTCue(startTime, endTime, "");
    copyNonConstructorProperties(newCue, previousCue.vttCue);
    return {
        vttCue: newCue,
        cueCategory: previousCue.cueCategory,
        editUuid: uuidv4(),
        addId: uuidv4()
    };
};

const validateShiftWithinChunkRange = (shiftTime: number, track: Track | null, cues: CueDto[]): void => {
    if (track && (track.mediaChunkStart || track.mediaChunkStart === 0) && track.mediaChunkEnd) {
        const editableCues = cues.filter(cue => !cue.editDisabled);
        const firstChunkCue = editableCues.shift();
        if (firstChunkCue && (firstChunkCue.vttCue.startTime + shiftTime) < (track.mediaChunkStart / 1000)) {
            throw new Error("Exceeds media chunk start range");
        }
        const lastChunkCue = editableCues.pop();
        if (lastChunkCue && (lastChunkCue.vttCue.endTime + shiftTime) > (track.mediaChunkEnd / 1000)) {
            throw new Error("Exceeds media chunk end range");
        }
    }
};

const validateShift = (position: ShiftPosition, cueIndex: number): void => {
    if(position === undefined) {
        throw new Error("Invalid position provided, all, before or after expected");
    }
    if (ShiftPosition.BEFORE === position && cueIndex === 0) {
        throw new Error("Cannot shift before first cue");
    }
    if (ShiftPosition.ALL !== position && cueIndex === -1) {
        throw new Error("No editing cue selected to begin shifting");
    }
};

export const updateMatchedCue = (
    dispatch: Dispatch<SubtitleEditAction>,
    state: SubtitleEditState,
    index: number
): void => {
    const { targetCuesIndex, editingIndexMatchedCues } = findMatchedIndexes(state, index);
    dispatch(matchedCuesSlice.actions.updateMatchedCue(
        { cue: state.cues[index], targetCuesIndex, editingIndexMatchedCues }
    ));
};

export const applySpellcheckerOnCue = createAsyncThunk(
    "spellchecker/applySpellcheckerOnCue",
    async (index: number, thunkApi) => {
        const state: SubtitleEditState = thunkApi.getState() as SubtitleEditState;
        const track = state.editingTrack as Track;
        const currentEditingCue = state.cues[index];
        if (currentEditingCue) {
            const text = currentEditingCue.vttCue.text as string;
            const spellCheckerSettings: SpellcheckerSettings = state.spellCheckerSettings;
            if (track && track.language?.id && spellCheckerSettings.enabled) {
                return fetchSpellCheck(text, spellCheckerSettings, track.language.id)
                    .then(spellCheck => {
                        addSpellCheck(thunkApi.dispatch, index, spellCheck, track.id);
                        const freshState: SubtitleEditState = thunkApi.getState() as SubtitleEditState;
                        updateMatchedCue(thunkApi.dispatch, freshState, index);
                    });
            }
        }
    }
);

export const updateMatchedCues = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState: Function): void => {
        const lastState = getState();
        dispatch(matchedCuesSlice.actions.matchCuesByTime(
            { cues: lastState.cues, sourceCues: lastState.sourceCues, editingCueIndex: lastState.editingCueIndex }
        ));
    };

export const checkSpelling = createAsyncThunk<
        void,
        { index: number },
        { state: SubtitleEditState }
    >(
    "validations/checkSpelling",
    async ({ index },
           thunkApi) => {
        if (index !== undefined) {
            const state = thunkApi.getState();
            const currentCue = state.cues[index];
            const oldErrorsCount = currentCue.errors?.length || 0;
            const cueErrors = conformToSpelling(currentCue);
            thunkApi.dispatch(cuesSlice.actions.setErrors(
                { index: index, errors: cueErrors } as CueErrorsPayload));
            if (cueErrors.length !== oldErrorsCount) {
                updateMatchedCue(thunkApi.dispatch, state, index);
                thunkApi.dispatch(callSaveCueUpdate(index));
            }
        }
    });

export const checkErrors = createAsyncThunk<
        void,
        { index: number; shouldSpellCheck: boolean },
        { state: SubtitleEditState }
    >(
    "validations/checkErrors",
    async ({ index, shouldSpellCheck },
           thunkApi) => {
        if (index !== undefined) {
            const state = thunkApi.getState();
            const subtitleSpecification = state.subtitleSpecifications;
            const overlapEnabled = state.editingTrack?.overlapEnabled;
            const cues = state.cues;
            const previousCue = cues[index - 1];
            const currentCue = cues[index];
            const followingCue = cues[index + 1];
            const oldErrorsCount = currentCue.errors?.length || 0;
            if (shouldSpellCheck) {
                thunkApi.dispatch(applySpellcheckerOnCue(index));
            }
            const cueErrors = conformToRules(
                currentCue, subtitleSpecification, previousCue, followingCue,
                overlapEnabled
            );
            thunkApi.dispatch(cuesSlice.actions.setErrors(
                { index: index, errors: cueErrors } as CueErrorsPayload));
            if (cueErrors.length !== oldErrorsCount) {
                updateMatchedCue(thunkApi.dispatch, state, index);
                thunkApi.dispatch(callSaveCueUpdate(index));
            }
        }
    });

export const validateCue = (
    dispatch: Dispatch<SubtitleEditAction | void>,
    index: number,
    shouldSpellCheck: boolean
): void => {
    dispatch(checkErrors({ index: index - 1, shouldSpellCheck: false }));
    dispatch(checkErrors({ index: index + 1, shouldSpellCheck: false }));
    dispatch(checkErrors({ index, shouldSpellCheck: shouldSpellCheck }));
};

const reorderCues = (
    dispatch: Dispatch<SubtitleEditAction>,
    state: SubtitleEditState,
    cuesToUpdate?: CueDto[]
): CueDto | null | undefined => {
    const newCues = cuesToUpdate ? cuesToUpdate : state.cues;
    const editingCueIndex = state.editingCueIndex;
    let editingCue = null;
    if (editingCueIndex > -1
        && newCues.length > editingCueIndex // This can happen when user closes one track and opens shorter track
    ) {
        editingCue = newCues[editingCueIndex];
    }
    const sortedCues = _.sortBy(newCues, (cue: CueDto) => cue.vttCue.startTime);
    dispatch(cuesSlice.actions.updateCues({ cues: sortedCues }));
    return editingCue;
};

const resetEditingIndexIfNeeded = (
    dispatch: Dispatch<SubtitleEditAction>,
    state: SubtitleEditState,
    newEditingCueIndex: number
): void => {
    const editingCueIndex = state.editingCueIndex;
    if (editingCueIndex != newEditingCueIndex) {
        dispatch(lastCueChangeSlice.actions.recordCueChange({ changeType: "UPDATE_ALL", index: -1 }));
        dispatch(focusedInputSlice.actions.updateFocusedInput("START_TIME"));
        dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx: newEditingCueIndex }));
    }
};

const resetEditingIndexTimeChangeIfNeeded = (
    dispatch: Dispatch<SubtitleEditAction>,
    state: SubtitleEditState,
    editUuid: string | null | undefined
): void => {
    const newEditingCueIndex = _.findIndex(state.cues, [ "editUuid", editUuid ]);
    resetEditingIndexIfNeeded(dispatch, state, newEditingCueIndex);
};

const resetEditingIndexAllCuesChangesIfNeeded = (
    dispatch: Dispatch<SubtitleEditAction>,
    state: SubtitleEditState,
    editingCue: CueDto | null | undefined
): void => {
    const newEditingCueIndex = _.findIndex(state.cues,
        (cue) => cue.vttCue.startTime === editingCue?.vttCue.startTime
            && cue.vttCue.endTime === editingCue?.vttCue.endTime);
    resetEditingIndexIfNeeded(dispatch, state, newEditingCueIndex);
};

// TODO: Consider separate actions for:
//    - shifting start time
//    - shifting end time
//    - updating cue text
//    - updating category and/or position
//  This way we could do less action or check only some validations related to the concrete action. This way we could
//  speed up the processing.
//  But this needs to be investigated, I am not saying that it is good idea.
export const updateVttCue = (
    idx: number,
    vttCue: VTTCue,
    editUuid?: string
): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void | null>, getState): void => {
        const cues = getState().cues;
        const originalCue = cues[idx];
        const cueErrors = [] as CueError[];

        if (originalCue && editUuid === originalCue.editUuid
            && getState().lastCueChange?.changeType !== "REMOVE"
        ) { // cue wasn't removed/changed in the meantime
            const newVttCue = new VTTCue(vttCue.startTime, vttCue.endTime, vttCue.text);
            copyNonConstructorProperties(newVttCue, vttCue);

            const previousCue = cues[idx - 1];
            const followingCue = cues[idx + 1];
            const subtitleSpecifications = getState().subtitleSpecifications;
            const track = getState().editingTrack as Track;
            const overlapCaptionsAllowed = track?.overlapEnabled;

            // TODO: Uff, this is book example of unmaintainable code. We have to remove such ugly if/Nelses.
            if (vttCue.startTime !== originalCue.vttCue.startTime) {
                if (!overlapCaptionsAllowed) {
                    if (applyOverlapPreventionStart(newVttCue, previousCue)) {
                        cueErrors.push(CueError.TIME_GAP_OVERLAP);
                    }
                }
                if (applyInvalidRangePreventionStart(newVttCue, subtitleSpecifications)) {
                    cueErrors.push(CueError.INVALID_RANGE_START);
                }
                if (applyInvalidChunkRangePreventionStart(newVttCue, originalCue.vttCue.startTime, track)) {
                    cueErrors.push(CueError.OUT_OF_CHUNK_RAGE);
                }
            }
            if (vttCue.endTime !== originalCue.vttCue.endTime) {
                if (!overlapCaptionsAllowed) {
                    if (applyOverlapPreventionEnd(newVttCue, followingCue)) {
                        cueErrors.push(CueError.TIME_GAP_OVERLAP);
                    }
                }
                if (applyInvalidRangePreventionEnd(newVttCue, subtitleSpecifications)) {
                    cueErrors.push(CueError.INVALID_RANGE_END);
                }
                if (applyInvalidChunkRangePreventionEnd(newVttCue, originalCue.vttCue.endTime, track)) {
                    cueErrors.push(CueError.OUT_OF_CHUNK_RAGE);
                }
            }

            if (shouldBlink(vttCue, newVttCue)) {
                dispatch(validationErrorSlice.actions.setValidationErrors(cueErrors));
            }

            const newCue = { ...originalCue, idx, vttCue: newVttCue, editUuid: uuidv4() };
            dispatch(cuesSlice.actions.updateVttCue(newCue));
            dispatch(lastCueChangeSlice.actions.recordCueChange({ changeType: "EDIT", index: idx, vttCue: newVttCue }));
            if (vttCue.startTime !== originalCue.vttCue.startTime) {
                const editingCue = reorderCues(dispatch, getState());
                resetEditingIndexTimeChangeIfNeeded(dispatch, getState(), editingCue?.editUuid);
            }

            // TODO: This is not possible to support searching of newly edited term, because of this discussion:
            //  https://dotsub.slack.com/archives/C02P5HLGC/p1675253139271659
            //  If we would want to enable this we would do something like in cueEditorSlices.updateEditingCueIndex
            //  But with current structure of this method + cues + matchedCues interaction,
            //  there would be endless recursion.
            //  Refactoring as suggested in function signature could help with this
            //  BTW, for effectively supporting this use case, we need to know current matchedCueIndex,
            //  which is not easy as we don't have it in hand
            // if (getState().searchReplaceVisible) {
            // ...
            // }
            // if (getState().searchReplaceVisible) {
            //    updateSearchMatches(dispatch, getState, idx);
            // }
            validateCue(dispatch, idx, true);
            dispatch(updateMatchedCues());
            dispatch(changeScrollPosition(ScrollPosition.CURRENT));
            dispatch(callSaveCueUpdate(idx));
        }
    };

export const updateVttCueTextOnly = (
    idx: number,
    vttCue: VTTCue,
    editUuid?: string
): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void | null>, getState): void => {
        const cues = getState().cues;
        const originalCue = cues[idx];

        if (originalCue && editUuid === originalCue.editUuid
            && getState().lastCueChange?.changeType !== "REMOVE"
        ) { // cue wasn't removed/changed in the meantime
            const newVttCue = new VTTCue(originalCue.vttCue.startTime, originalCue.vttCue.endTime, vttCue.text);
            copyNonConstructorProperties(newVttCue, originalCue.vttCue);

            const newCue = { ...originalCue, idx, vttCue: newVttCue, editUuid: uuidv4() };
            dispatch(cuesSlice.actions.updateVttCue(newCue));
            dispatch(lastCueChangeSlice.actions.recordCueChange({ changeType: "EDIT", index: idx, vttCue: newVttCue }));
            dispatch(checkErrors({ index: idx, shouldSpellCheck: true }));
            updateMatchedCue(dispatch, getState(), idx);
        }
    };

export const validateVttCue = (idx: number): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void | null>, getState): void => {
        validateCue(dispatch, idx, false);
        updateMatchedCue(dispatch, getState(), idx);
    };

export const removeIgnoredSpellcheckedMatchesFromAllCues = (): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction>, getState): void => {
        const trackId = getState().editingTrack?.id;
        if (trackId) {
            dispatch(cuesSlice.actions
                .removeIgnoredSpellcheckedMatchesFromAllCues({ trackId: trackId } as SpellCheckRemovalAction));
        }
    };

export const validateCorruptedCues = createAsyncThunk<
        void,
        string,
        { state: SubtitleEditState }
    >(
    "validations/validateCorruptedCues",
    async (matchText, thunkAPI) => {
        const state: SubtitleEditState = thunkAPI.getState();
        const cues = state.cues;
        cues.filter(cue => cue.errors
            && cue.vttCue.text.includes(matchText)).forEach((cue: CueDto) => {
            thunkAPI.dispatch(checkErrors({ index: cues.indexOf(cue), shouldSpellCheck: false }));
        });
    });

export const updateCueCategory = (idx: number, cueCategory: CueCategory): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction>, getState): void => {
        dispatch(cuesSlice.actions.updateCueCategory({ idx, cueCategory }));
        updateMatchedCue(dispatch, getState(), idx);
        dispatch(callSaveCueUpdate(idx));
    };

export const addCueComment = (idx: number, cueComment: CueComment): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        dispatch(cuesSlice.actions.addCueComment({ idx, cueComment }));
        updateMatchedCue(dispatch, getState(), idx);
        dispatch(callSaveCueUpdate(idx));
    };

export const deleteCueComment = (idx: number, cueCommentIndex: number): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        dispatch(cuesSlice.actions.deleteCueComment({ idx, cueCommentIndex }));
        updateMatchedCue(dispatch, getState(), idx);
        dispatch(callSaveCueUpdate(idx));
    };

export const saveTrack = (): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        callSaveTrack(dispatch, getState);
    };

export const addCue = (idx: number, sourceIndexes: number[]): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction>, getState): void => {
        const state: SubtitleEditState = getState();
        const subtitleSpecifications = state.subtitleSpecifications;
        const timeGapLimit = getTimeGapLimits(subtitleSpecifications);
        let step = Math.min(timeGapLimit.maxGap, NEW_ADDED_CUE_DEFAULT_STEP);
        if (timeGapLimit.minGap > step) {
            step = timeGapLimit.minGap;
        }
        const cues = state.cues;
        const previousCue = cues[idx - 1] || DEFAULT_CUE;
        const startTime = sourceIndexes !== undefined
            && sourceIndexes[0] !== undefined
            && state.sourceCues[sourceIndexes[0]].vttCue.startTime
                ? state.sourceCues[sourceIndexes[0]].vttCue.startTime
                : previousCue.vttCue.endTime;
        const endTime = sourceIndexes && sourceIndexes.length > 0
            ? state.sourceCues[sourceIndexes[sourceIndexes.length - 1]].vttCue.endTime
            : previousCue.vttCue.endTime + step;
        const cue = createAndAddCue(previousCue, startTime, endTime);
        const overlapCaptionsAllowed = getState().editingTrack?.overlapEnabled;

        let overlapStartPrevented = false;
        let overlapEndPrevented = false;
        if (!overlapCaptionsAllowed) {
            const followingCue = cues[idx];
            overlapStartPrevented = applyOverlapPreventionStart(cue.vttCue, previousCue);
            overlapEndPrevented = applyOverlapPreventionEnd(cue.vttCue, followingCue);
        }

        const editingTrack = state.editingTrack;
        const validCueDuration = editingTrack && verifyCueDuration(cue.vttCue, editingTrack, timeGapLimit);
        if (validCueDuration) {
            dispatch(cuesSlice.actions.addCue({ idx, cue }));
            dispatch(lastCueChangeSlice.actions.recordCueChange({ changeType: "ADD", index: idx, vttCue: cue.vttCue }));
            if (cues.length === 0) {
                callSaveTrack(dispatch, getState);
                return;
            }
            dispatch(updateMatchedCues());
            dispatch(changeScrollPosition(ScrollPosition.CURRENT));
            dispatch(callSaveCueUpdate(idx));
        } else {
            const error = overlapStartPrevented || overlapEndPrevented
                ? CueError.TIME_GAP_OVERLAP
                : CueError.TIME_GAP_LIMIT_EXCEEDED;
            dispatch(validationErrorSlice.actions.setValidationErrors([error]));
        }
    };

export const splitCue = (idx: number): AppThunk =>
    async (dispatch: Dispatch<SubtitleEditAction | void | null>, getState): Promise<void> => {
        const state: SubtitleEditState = getState();
        const subtitleSpecifications = state.subtitleSpecifications;
        const timeGapLimit = getTimeGapLimits(subtitleSpecifications);
        const originalCue = state.cues[idx];
        const originalStartTime = originalCue.vttCue.startTime;
        const originalEndTime = originalCue.vttCue.endTime;
        const splitStartTime = originalStartTime + ((originalEndTime - originalStartTime) / 2);
        const splitCue = createAndAddCue(originalCue, splitStartTime, originalEndTime);
        const updatedVttCue =
            new VTTCue(originalCue.vttCue.startTime, splitStartTime, originalCue.vttCue.text);

        const editingTrack = state.editingTrack;
        const validCueDuration = editingTrack && verifyCueDuration(updatedVttCue, editingTrack, timeGapLimit);

        if (validCueDuration) {
            copyNonConstructorProperties(updatedVttCue, originalCue.vttCue);
            const updatedCue = { ...originalCue, idx, vttCue: updatedVttCue, editUuid: originalCue.editUuid };
            dispatch(cuesSlice.actions.updateVttCue(updatedCue));
            dispatch(cuesSlice.actions.addCue({ idx: idx + 1, cue: splitCue }));
            await dispatch(lastCueChangeSlice.actions.recordCueChange(
                { changeType: "EDIT", index: idx, vttCue: updatedCue.vttCue }));
            dispatch(lastCueChangeSlice.actions.recordCueChange(
                { changeType: "SPLIT", index: idx, vttCue: originalCue.vttCue }));
            dispatch(updateMatchedCues());
            dispatch(lastCueChangeSlice.actions.recordCueChange(
                { changeType: "ADD" , index: (idx + 1), vttCue: splitCue.vttCue }));
            dispatch(callSaveCueUpdate(idx));
            dispatch(callSaveCueUpdate(idx + 1));
        } else {
            dispatch(validationErrorSlice.actions.setValidationErrors([CueError.SPLIT_ERROR]));
        }
    };

const saveDeleteStubCueIfNeeded = (
    cuesLength: number,
    dispatch: Dispatch<SubtitleEditAction | null>,
    getState: Function
) => {
    if (cuesLength === 1) {
        const stubCue = getState().cues[0];
        if (stubCue.addId) {
            dispatch(callSaveCueUpdate(0));
        }
    }
};

export const deleteCue = (idx: number): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | null>, getState): void => {
        const cueToDelete = getState().cues[idx];
        const cuesLength = getState().cues.length;
        dispatch(cuesSlice.actions.deleteCue({ idx }));

        dispatch(lastCueChangeSlice.actions
            .recordCueChange({
                changeType: cuesLength === 1 ? "EDIT" : "REMOVE",
                index: idx, vttCue: new VTTCue(0, 0, "")
            }
            ));
        dispatch(updateMatchedCues());
        callSaveCueDelete(getState, cueToDelete);
        saveDeleteStubCueIfNeeded(cuesLength, dispatch, getState);
    };

export const updateCues = (cues: CueDto[]): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction>, getState): void => {
        const editingCue = reorderCues(dispatch, getState(), cues);
        resetEditingIndexAllCuesChangesIfNeeded(dispatch, getState(), editingCue);
        dispatch(lastCueChangeSlice.actions.recordCueChange({ changeType: "UPDATE_ALL", index: -1 }));
        dispatch(updateMatchedCues());
    };

export const applyShiftTimeByPosition = (shiftPosition: ShiftPosition, cueIndex: number, shiftTime: number): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction>, getState): void => {
        const editingTrack = getState().editingTrack;
        validateShift(shiftPosition, cueIndex);
        validateShiftWithinChunkRange(shiftTime, editingTrack, getState().cues);
        dispatch(cuesSlice.actions.applyShiftTimeByPosition({ cueIndex, shiftTime, shiftPosition }));
        if (cueIndex > 0) {
            const editingCue = reorderCues(dispatch, getState());
            resetEditingIndexTimeChangeIfNeeded(dispatch, getState(), editingCue?.editUuid);
        }
        dispatch(updateMatchedCues());
        callSaveTrack(dispatch, getState);
    };

export const syncCues = (): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction>, getState): void => {
        const cues = getState().sourceCues;
        if (cues && cues.length > 0) {
            dispatch(cuesSlice.actions.syncCues({ cues }));
            dispatch(updateMatchedCues());
            callSaveTrack(dispatch, getState);
        }
    };

export const addCuesToMergeList = (row: CuesWithRowIndex): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void | null>>): void =>
        dispatch(rowsToMergeSlice.actions.addRowCues(row));

export const removeCuesToMergeList = (row: CuesWithRowIndex): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void | null>>): void =>
        dispatch(rowsToMergeSlice.actions.removeRowCues(row));

export const mergeCues = (): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void | null>, getState): void => {
        let mergeSuccess = false;
        const rowsToMerge = _.sortBy(getState().rowsToMerge, row => row.index);
        if (rowsToMerge && rowsToMerge.length > 0) {
            const cuesToMerge = rowsToMerge.map(row => row.cues || []).reduce((cues1, cues2) => cues1.concat(...cues2));
            if (cuesToMerge.length >= 2) {
                let mergedContent = "";
                const mergedErrors = [] as CueError[];
                const mergedGlossaryMatches = [] as GlossaryMatchDto[];
                const mergedComments = [] as CueComment[];
                let rowStartTime = 0;
                let rowEndTime = 0;
                let firstCue = {} as CueDtoWithIndex;
                let lastCue = {} as CueDtoWithIndex;
                cuesToMerge.forEach((cue: CueDtoWithIndex, cueIndex: number) => {
                    if (cue.cue.errors && cue.cue.errors.length > 0) {
                        mergedErrors.push(...cue.cue.errors);
                    }
                    if (cue.cue.glossaryMatches && cue.cue.glossaryMatches.length > 0) {
                        mergedGlossaryMatches.push(...cue.cue.glossaryMatches);
                    }
                    if (cueIndex === 0) {
                        firstCue = cue;
                        rowStartTime = cue.cue.vttCue.startTime;
                    } else {
                        mergedContent += "\n";
                    }
                    if (cueIndex === cuesToMerge.length - 1) {
                        lastCue = cue;
                        rowEndTime = cue.cue.vttCue.endTime;
                    }
                    mergedContent += cue.cue.vttCue.text;
                    if (cue.cue.comments && cue.cue.comments.length > 0) {
                        mergedComments.push(...cue.cue.comments);
                    }
                });
                const mergedVttCue = new VTTCue(rowStartTime, rowEndTime, mergedContent);
                copyNonConstructorProperties(mergedVttCue, firstCue.cue.vttCue);
                const mergedCue = {
                    addId: uuidv4(),
                    vttCue: mergedVttCue,
                    errors: mergedErrors,
                    glossaryMatches: mergedGlossaryMatches,
                    searchReplaceMatches: undefined,
                    editUuid: firstCue.cue.editUuid,
                    cueCategory: firstCue.cue.cueCategory,
                    comments: mergedComments
                } as CueDto;

                const state: SubtitleEditState = getState();
                const subtitleSpecifications = state.subtitleSpecifications;
                const timeGapLimit = getTimeGapLimits(subtitleSpecifications);
                const editingTrack = state.editingTrack;
                const validCueDuration = editingTrack && verifyCueDuration(mergedVttCue, editingTrack, timeGapLimit);

                if (validCueDuration) {
                    dispatch(focusedInputSlice.actions.updateFocusedInput("EDITOR"));
                    const cuesState = [ ...getState().cues ];
                    const cuesToDelete = cuesState.splice(firstCue.index, (lastCue.index + 1) - firstCue.index);
                    dispatch(cuesSlice.actions.mergeCues(
                        { mergedCue, startIndex: firstCue.index, endIndex: lastCue.index }));
                    dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx: firstCue.index }));
                    dispatch(changeScrollPosition(ScrollPosition.CURRENT));
                    dispatch(lastCueChangeSlice.actions.recordCueChange(
                        { changeType: "MERGE", index: firstCue.index, vttCue: mergedVttCue }));
                    dispatch(updateMatchedCues());
                    dispatch(callSaveCueUpdate(firstCue.index));
                    cuesToDelete.forEach((cueDto: CueDto) => callSaveCueDelete(getState, cueDto));
                    mergeSuccess = true;
                }
            }
        }
        if (!mergeSuccess) {
            dispatch(validationErrorSlice.actions.setValidationErrors([CueError.MERGE_ERROR]));
        }
    };
