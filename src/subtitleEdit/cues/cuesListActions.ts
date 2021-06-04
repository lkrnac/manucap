import { Dispatch } from "react";
import { createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import {
    CueCategory,
    CueDto,
    CueError,
    ScrollPosition,
    SpellcheckerSettings,
    SubtitleEditAction,
    Track,
    CuesWithRowIndex
} from "../model";
import { AppThunk, SubtitleEditState } from "../subtitleEditReducers";
import { constructCueValuesArray, copyNonConstructorProperties } from "./cueUtils";
import { Constants } from "../constants";
import {
    applyInvalidChunkRangePreventionEnd,
    applyInvalidChunkRangePreventionStart,
    applyInvalidRangePreventionEnd,
    applyInvalidRangePreventionStart,
    applyLineLimitation,
    applyOverlapPreventionEnd,
    applyOverlapPreventionStart,
    conformToRules,
    getTimeGapLimits,
    verifyCueDuration
} from "./cueVerifications";
import { scrollPositionSlice } from "./cuesListScrollSlice";
import { addSpellCheck, fetchSpellCheck } from "./spellCheck/spellCheckFetch";
import { lastCueChangeSlice, updateSearchMatches, validationErrorSlice } from "./edit/cueEditorSlices";
import { CueErrorsPayload, cuesSlice, mergeSlice, SpellCheckRemovalAction } from "./cuesListSlices";
import { callSaveTrack } from "./saveSlices";

interface CuesAction extends SubtitleEditAction {
    cues: CueDto[];
}

const shouldBlink = (x: VTTCue, y: VTTCue, textOnly?: boolean): boolean => {
    return textOnly ?
        x.text !== y.text :
        JSON.stringify(constructCueValuesArray(x)) !== JSON.stringify(constructCueValuesArray(y));
};

const createAndAddCue = (previousCue: CueDto, startTime: number, endTime: number): CueDto => {
    const newCue = new VTTCue(startTime, endTime, "");
    copyNonConstructorProperties(newCue, previousCue.vttCue);
    return { vttCue: newCue, cueCategory: previousCue.cueCategory, editUuid: uuidv4() };
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

export const applySpellcheckerOnCue = createAsyncThunk(
    "spellchecker/applySpellcheckerOnCue",
    async (index: number, thunkAPI) => {
        const state: SubtitleEditState = thunkAPI.getState() as SubtitleEditState;
        const track = state.editingTrack as Track;
        const currentEditingCue = state.cues[index];
        if (currentEditingCue) {
            const text = currentEditingCue.vttCue.text as string;
            const spellCheckerSettings: SpellcheckerSettings = state.spellCheckerSettings;
            if (track && track.language?.id && spellCheckerSettings.enabled) {
                return fetchSpellCheck(text, spellCheckerSettings, track.language.id)
                    .then(spellCheck => {
                            addSpellCheck(thunkAPI.dispatch, index, spellCheck, track.id);
                        }
                    );
            }
        }
    }
);


export const checkErrors = createAsyncThunk(
    "validations/checkErrors",
    async ({ index, shouldSpellCheck }: { index: number; shouldSpellCheck: boolean },
           thunkApi) => {
        if (index !== undefined) {
            const state: SubtitleEditState = thunkApi.getState() as SubtitleEditState;
            const subtitleSpecification = state.subtitleSpecifications;
            const overlapEnabled = state.editingTrack?.overlapEnabled;
            const cues = state.cues;
            const previousCue = cues[index - 1];
            const currentCue = cues[index];
            const followingCue = cues[index + 1];
            if (currentCue != null) {
                if (shouldSpellCheck) {
                    thunkApi.dispatch(applySpellcheckerOnCue(index));
                }
                const cueErrors = conformToRules(
                    currentCue, subtitleSpecification, previousCue, followingCue,
                    overlapEnabled
                );
                thunkApi.dispatch(cuesSlice.actions.setErrors(
                    { index: index, errors: cueErrors } as CueErrorsPayload));
            }
        }
    });


const validateCue = (
    dispatch: Dispatch<SubtitleEditAction | void>,
    index: number,
    shouldSpellCheck: boolean
): void => {
    dispatch(checkErrors({ index: index - 1, shouldSpellCheck: false }));
    dispatch(checkErrors({ index, shouldSpellCheck: shouldSpellCheck }));
    dispatch(checkErrors({ index: index + 1, shouldSpellCheck: false }));
};

export const updateVttCue = (
    idx: number,
    vttCue: VTTCue,
    editUuid?: string,
    textOnly?: boolean,
    multiCuesEdit?: boolean
): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void | null>, getState): void => {
        const cues = getState().cues;
        const originalCue = cues[idx];
        const cueErrors = [] as CueError[];
        if (originalCue && editUuid === originalCue.editUuid) { // cue wasn't removed/changed in the meantime
            let newVttCue = new VTTCue(vttCue.startTime, vttCue.endTime, vttCue.text);
            if (textOnly) {
                newVttCue = new VTTCue(originalCue.vttCue.startTime, originalCue.vttCue.endTime, vttCue.text);
                copyNonConstructorProperties(newVttCue, originalCue.vttCue);
            } else {
                copyNonConstructorProperties(newVttCue, vttCue);
            }

            const previousCue = cues[idx - 1];
            const followingCue = cues[idx + 1];
            const subtitleSpecifications = getState().subtitleSpecifications;
            const track = getState().editingTrack as Track;
            const overlapCaptionsAllowed = track?.overlapEnabled;

            // TODO: Uff, this is book example of unmaintainable code. We have to remove such ugly if/elses.
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
            if (applyLineLimitation(newVttCue, originalCue, subtitleSpecifications)) {
                cueErrors.push(CueError.LINE_COUNT_EXCEEDED);
            }

            if (shouldBlink(vttCue, newVttCue, textOnly)) {
                dispatch(validationErrorSlice.actions.setValidationErrors(cueErrors));
            }

            const newCue = { ...originalCue, idx, vttCue: newVttCue, editUuid: uuidv4() };
            dispatch(cuesSlice.actions.updateVttCue(newCue));
            dispatch(lastCueChangeSlice.actions.recordCueChange({ changeType: "EDIT", index: idx, vttCue: newVttCue }));
            dispatch(scrollPositionSlice.actions.changeScrollPosition(ScrollPosition.CURRENT));
            updateSearchMatches(dispatch, getState, idx);
            validateCue(dispatch, idx, true);
            callSaveTrack(dispatch, getState, multiCuesEdit);
        }
    };

export const validateVttCue = (idx: number): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void | null>, getState): void => {
        validateCue(dispatch, idx, false);
        callSaveTrack(dispatch, getState);
    };

export const removeIgnoredSpellcheckedMatchesFromAllCues = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        const trackId = getState().editingTrack?.id;
        if (trackId) {
            dispatch(cuesSlice.actions
                .removeIgnoredSpellcheckedMatchesFromAllCues({ trackId: trackId } as SpellCheckRemovalAction));
        }
    };

export const validateCorruptedCues = createAsyncThunk(
    "validations/validateCorruptedCues",
    async (matchText: string, thunkAPI) => {
        const state: SubtitleEditState = thunkAPI.getState() as SubtitleEditState;
        const cues = state.cues;
        cues.filter(cue => cue.errors
            && cue.vttCue.text.includes(matchText)).forEach((cue: CueDto) => {
            thunkAPI.dispatch(checkErrors({ index: cues.indexOf(cue), shouldSpellCheck: false }));
        });
    });

export const updateCueCategory = (idx: number, cueCategory: CueCategory): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState): void => {
        dispatch(cuesSlice.actions.updateCueCategory({ idx, cueCategory }));
        callSaveTrack(dispatch, getState);
    };

export const addCue = (idx: number, sourceIndexes: number[]): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | null>>, getState): void => {
        const state: SubtitleEditState = getState();
        const subtitleSpecifications = state.subtitleSpecifications;
        const timeGapLimit = getTimeGapLimits(subtitleSpecifications);
        const step = Math.min(timeGapLimit.maxGap, Constants.NEW_ADDED_CUE_DEFAULT_STEP);
        const cues = state.cues;
        const previousCue = cues[idx - 1] || Constants.DEFAULT_CUE;
        const startTime = sourceIndexes !== undefined
            && sourceIndexes[0] !== undefined
            && state.sourceCues[sourceIndexes[0]].vttCue.startTime >= previousCue.vttCue.endTime
                ? state.sourceCues[sourceIndexes[0]].vttCue.startTime
                : previousCue.vttCue.endTime;
        const endTime = sourceIndexes && sourceIndexes.length > 0
            ? state.sourceCues[sourceIndexes[sourceIndexes.length - 1]].vttCue.endTime
            : previousCue.vttCue.endTime + step;
        const cue = createAndAddCue(previousCue, startTime, endTime);
        const overlapCaptionsAllowed = getState().editingTrack?.overlapEnabled;

        if (!overlapCaptionsAllowed) {
            const followingCue = cues[idx];
            applyOverlapPreventionStart(cue.vttCue, previousCue);
            applyOverlapPreventionEnd(cue.vttCue, followingCue);
        }

        const editingTrack = state.editingTrack;
        const validCueDuration = editingTrack && verifyCueDuration(cue.vttCue, editingTrack, timeGapLimit);

        if (validCueDuration) {
            dispatch(cuesSlice.actions.addCue({ idx, cue }));
            dispatch(lastCueChangeSlice.actions.recordCueChange({ changeType: "ADD", index: idx, vttCue: cue.vttCue }));
            dispatch(scrollPositionSlice.actions.changeScrollPosition(ScrollPosition.CURRENT));
        } else {
            dispatch(validationErrorSlice.actions.setValidationErrors([CueError.TIME_GAP_OVERLAP]));
        }
    };

export const deleteCue = (idx: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void | null>>, getState): void => {
        dispatch(cuesSlice.actions.deleteCue({ idx }));
        dispatch(lastCueChangeSlice.actions
            .recordCueChange({ changeType: "REMOVE", index: idx, vttCue: new VTTCue(0, 0, "") }));
        callSaveTrack(dispatch, getState);
    };

export const updateCues = (cues: CueDto[]): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CuesAction>>): void => {
        dispatch(cuesSlice.actions.updateCues({ cues }));
    };

export const applyShiftTime = (shiftTime: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState): void => {
        const editingTrack = getState().editingTrack;
        validateShiftWithinChunkRange(shiftTime, editingTrack, getState().cues);
        dispatch(cuesSlice.actions.applyShiftTime(shiftTime));
        callSaveTrack(dispatch, getState, true);
    };

export const syncCues = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState): void => {
        const cues = getState().sourceCues;
        if (cues && cues.length > 0) {
            dispatch(cuesSlice.actions.syncCues({ cues }));
            callSaveTrack(dispatch, getState, true);
        }
    };

export const addCuesToMergeList = (row: CuesWithRowIndex): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void | null>>): void =>
        dispatch(mergeSlice.actions.addRowCues(row));

export const removeCuesToMergeList = (row: CuesWithRowIndex): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void | null>>): void =>
        dispatch(mergeSlice.actions.removeRowCues(row));

export const mergeCues = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState): void => {
        const rowsToMerge = getState().rowsToMerge;
        if (rowsToMerge && rowsToMerge.length > 0) {
            dispatch(cuesSlice.actions.mergeCues({ rows: rowsToMerge }));
            callSaveTrack(dispatch, getState, true);
        }
    };
