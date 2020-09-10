import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

import { CueCategory, CueChange, CueDto, ScrollPosition, SubtitleEditAction } from "../model";
import { AppThunk, SubtitleEditState } from "../subtitleEditReducers";
import { constructCueValuesArray, copyNonConstructorProperties, } from "./cueUtils";
import { Constants } from "../constants";
import { editingTrackSlice } from "../trackSlices";
import { SubtitleSpecificationAction, subtitleSpecificationSlice } from "../toolbox/subtitleSpecificationSlice";
import {
    applyCharacterLimitation,
    applyInvalidRangePreventionEnd,
    applyInvalidRangePreventionStart,
    applyOverlapPreventionEnd,
    applyOverlapPreventionStart,
    conformToRules,
    getTimeGapLimits,
    markCues,
    verifyCueDuration
} from "./cueVerifications";
import { scrollPositionSlice } from "./cuesListScrollSlice";
import { SpellCheck } from "./spellCheck/model";
import { fetchSpellCheck } from "./spellCheck/spellCheckFetch";
import { getCueIgnoredKeywords } from "./spellCheck/spellCheckerUtils";

export interface CueIndexAction extends SubtitleEditAction {
    idx: number;
}

export interface VttCueAction extends CueIndexAction {
    vttCue: VTTCue;
    editUuid?: string;
}

export interface CueCategoryAction extends CueIndexAction {
    cueCategory: CueCategory;
}

export interface CueAction extends CueIndexAction {
    cue: CueDto;
}

interface CuesAction extends SubtitleEditAction {
    cues: CueDto[];
}

interface CheckOptions extends SubtitleSpecificationAction {
    overlapEnabled?: boolean;
    index?: number;
}

export interface SpellCheckAction extends CueIndexAction {
    spellCheck: SpellCheck;
}
export interface SpellCheckRemovalAction extends CueIndexAction {
    offset: number;
}

const shouldBlink = (x: VTTCue, y: VTTCue, textOnly?: boolean): boolean => {
    return textOnly ?
        x.text !== y.text :
        JSON.stringify(constructCueValuesArray(x)) !== JSON.stringify(constructCueValuesArray(y));
};

const createAndAddCue = (previousCue: CueDto,
                         maxGapLimit: number,
                         sourceCue?: CueDto): CueDto => {
    const startTime = sourceCue
        ? sourceCue.vttCue.startTime
        : previousCue.vttCue.endTime;
    const endTime = sourceCue
        ? sourceCue.vttCue.endTime
        : previousCue.vttCue.endTime + maxGapLimit;
    const newCue = new VTTCue(startTime, endTime, "");
    copyNonConstructorProperties(newCue, previousCue.vttCue);
    return { vttCue: newCue, cueCategory: previousCue.cueCategory, editUuid: uuidv4() };
};

export const cuesSlice = createSlice({
    name: "cues",
    initialState: [] as CueDto[],
    reducers: {
        updateVttCue: (state, action: PayloadAction<VttCueAction>): void => {
            state[action.payload.idx] = {
                ...state[action.payload.idx],
                vttCue: action.payload.vttCue,
                editUuid: action.payload.editUuid
            };
        },
        updateCueCategory: (state, action: PayloadAction<CueCategoryAction>): void => {
            if (state[action.payload.idx]) {
                state[action.payload.idx] = {
                    ...state[action.payload.idx],
                    cueCategory: action.payload.cueCategory
                };
            }
        },
        addSpellCheck: (state, action: PayloadAction<SpellCheckAction>): void => {
            state[action.payload.idx] = {
                ...state[action.payload.idx],
                spellCheck: action.payload.spellCheck
            };
        },
        removeSpellCheckMatch: (state, action: PayloadAction<SpellCheckRemovalAction>): void => {
            const cue = state[action.payload.idx];
            if (cue.spellCheck) {
                const deletedIndex = cue.spellCheck.matches.findIndex(match => match.offset === action.payload.offset);

                cue.spellCheck.matches.splice(deletedIndex, 1);

                // cue.spellCheck.matches[]

                // console.log("index");
                // console.log(cue.spellCheck.matches.findIndex(match => match.offset === action.payload.offset));
                // cue.spellCheck.matches = [];
                console.log("cue after match removal");
                console.log(cue.spellCheck.matches);
            }



        },
        addCue: (state, action: PayloadAction<CueAction>): void => {
            state.splice(action.payload.idx, 0, action.payload.cue);
        },
        deleteCue: (state, action: PayloadAction<CueIndexAction>): void => {
            if (state.length > 1) {
                state.splice(action.payload.idx, 1);
            } else {
                // default empty cue
                const newVttCue = new VTTCue(0, 3, "");
                // this is a hack just to avoid uninitialized properties
                copyNonConstructorProperties(newVttCue, newVttCue);
                state[0] = {
                    vttCue: newVttCue,
                    cueCategory: "DIALOGUE"
                };
            }
        },
        updateCues: (_state, action: PayloadAction<CuesAction>): CueDto[] => action.payload.cues,
        applyShiftTime: (state, action: PayloadAction<number>): CueDto[] => {
            const shift = action.payload;
            return state.map((cue: CueDto) => {
                const vttCue = cue.vttCue;
                const startTime = vttCue.startTime + shift;
                const endTime = vttCue.endTime + shift;
                const newCue = new VTTCue(startTime, endTime, vttCue.text);
                copyNonConstructorProperties(newCue, vttCue);
                return ({ ...cue, vttCue: newCue } as CueDto);
            });
        },
        checkErrors: (state, action: PayloadAction<CheckOptions>): void => {
            const index = action.payload.index;
            if (index !== undefined) {
                const subtitleSpecification = action.payload.subtitleSpecification;
                const overlapCaptions = action.payload.overlapEnabled;

                const previousPreviousCue = state[index - 2];
                const previousCue = state[index - 1];
                const currentCue = state[index];
                const followingCue = state[index + 1];
                const followingFollowingCue = state[index + 2];
                if (previousCue) {
                    previousCue.corrupted = !conformToRules(
                        previousCue, subtitleSpecification, previousPreviousCue, currentCue, overlapCaptions
                    );
                }
                currentCue.corrupted =
                    !conformToRules(
                        currentCue, subtitleSpecification, previousCue, followingCue, overlapCaptions
                    );
                if (followingCue) {
                    followingCue.corrupted = !conformToRules(
                        followingCue, subtitleSpecification, currentCue, followingFollowingCue, overlapCaptions
                    );
                }
            }
        },
        syncCues: (state, action: PayloadAction<CuesAction>): CueDto[] => {
            const sourceCues = action.payload.cues;
            return state.map((cue: CueDto, index: number) => {
                const vttCue = cue.vttCue;
                const startTime = sourceCues[index].vttCue.startTime;
                const endTime = sourceCues[index].vttCue.endTime;
                const newCue = new VTTCue(startTime, endTime, vttCue.text);
                copyNonConstructorProperties(newCue, vttCue);
                return ({ ...cue, vttCue: newCue } as CueDto);
            });
        }
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CueDto[] => [],
        [subtitleSpecificationSlice.actions.readSubtitleSpecification.type]:
            (state, action: PayloadAction<CheckOptions>): CueDto[] =>
                markCues(state, action.payload.subtitleSpecification, action.payload.overlapEnabled),
    }
});

export const editingCueIndexSlice = createSlice({
    name: "editingCueIndex",
    initialState: -1,
    reducers: {
        updateEditingCueIndex: (_state, action: PayloadAction<CueIndexAction>): number => action.payload.idx,
    },
    extraReducers: {
        [cuesSlice.actions.addCue.type]:
            (_state, action: PayloadAction<CueIndexAction>): number => action.payload.idx,
        [cuesSlice.actions.deleteCue.type]: (): number => -1,
        [cuesSlice.actions.updateCues.type]: (): number => -1,

    }
});

export const sourceCuesSlice = createSlice({
    name: "sourceCues",
    initialState: [] as CueDto[],
    reducers: {
        updateSourceCues: (_state, action: PayloadAction<CuesAction>): CueDto[] => action.payload.cues
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CueDto[] => []
    }
});

export const validationErrorSlice = createSlice({
    name: "validationError",
    initialState: false,
    reducers: {
        setValidationError: (_state, action: PayloadAction<boolean>): boolean => action.payload
    },
    extraReducers: {
        [editingCueIndexSlice.actions.updateEditingCueIndex.type]: (): boolean => false
    }
});

export const lastCueChangeSlice = createSlice({
    name: "lastCueChange",
    initialState: null as CueChange | null,
    reducers: {
        recordCueChange: (_state, action: PayloadAction<CueChange>): CueChange => action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CueChange | null => null
    }
});

export const updateVttCue = (idx: number, vttCue: VTTCue, editUuid?: string, textOnly?: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        const cues = getState().cues;
        const originalCue = cues[idx];
        if (originalCue && editUuid === originalCue.editUuid) { // cue wasn't removed in the meantime from cues list
            const track = getState().editingTrack;

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
            const overlapCaptionsAllowed = track?.overlapEnabled;

            if (vttCue.startTime !== originalCue.vttCue.startTime) {
                overlapCaptionsAllowed || applyOverlapPreventionStart(newVttCue, previousCue);
                applyInvalidRangePreventionStart(newVttCue, subtitleSpecifications);
            }
            if (vttCue.endTime !== originalCue.vttCue.endTime) {
                overlapCaptionsAllowed || applyOverlapPreventionEnd(newVttCue, followingCue);
                applyInvalidRangePreventionEnd(newVttCue, subtitleSpecifications);
            }
            applyCharacterLimitation(newVttCue, originalCue, subtitleSpecifications);

            if (shouldBlink(vttCue, newVttCue, textOnly)) {
                dispatch(validationErrorSlice.actions.setValidationError(true));
            }

            dispatch(cuesSlice.actions.updateVttCue({ idx, vttCue: newVttCue, editUuid }));
            dispatch(lastCueChangeSlice.actions.recordCueChange({ changeType: "EDIT", index: idx, vttCue: newVttCue }));

            const language = track?.language?.id;
            const spellCheckerDomain = getState().spellCheckerDomain;
            if (language && spellCheckerDomain) {
                console.log(localStorage);
                let text = newVttCue.text.replace(/<[^>]*>*/g, "");
                const trackId = track?.id;
                const ignores = getCueIgnoredKeywords(trackId, editUuid);
                console.log("text before to spellchecker " + text);
                console.log("ignores ");
                console.log(ignores);
                text = text.replace(new RegExp("<[^>]*>*", "g"), "");

                ignores?.forEach(item => {
                    text = text.replace(new RegExp(`${item}`, "g"),"");
                });
                console.log("text sent to spellchecker " + text);
                fetchSpellCheck(dispatch, getState, idx, text, language, spellCheckerDomain);
            }
            dispatch(cuesSlice.actions.checkErrors({
                subtitleSpecification: subtitleSpecifications,
                overlapEnabled: overlapCaptionsAllowed,
                index: idx
            }));
        }
    };


export const removeSpellcheckMatch = (cueIdx: number, offset: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
     dispatch(cuesSlice.actions.removeSpellCheckMatch({ idx: cueIdx, offset: offset }));
    };
export const validateCue = (idx: number, editUuid?: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        const cues = getState().cues;
        const originalCue = cues[idx];
        if (originalCue && editUuid === originalCue.editUuid) { // cue wasn't removed in the meantime from cues list
            const track = getState().editingTrack;
            const subtitleSpecifications = getState().subtitleSpecifications;
            const overlapCaptionsAllowed = track?.overlapEnabled;

            dispatch(cuesSlice.actions.checkErrors({
                subtitleSpecification: subtitleSpecifications,
                overlapEnabled: overlapCaptionsAllowed,
                index: idx
            }));
        }
    };


export const updateCueCategory = (idx: number, cueCategory: CueCategory): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueCategoryAction>>): void => {
        dispatch(cuesSlice.actions.updateCueCategory({ idx, cueCategory }));
    };

export const addCue = (idx: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        const state: SubtitleEditState = getState();
        const subtitleSpecifications = state.subtitleSpecifications;
        const timeGapLimit = getTimeGapLimits(subtitleSpecifications);
        const step = Math.min(timeGapLimit.maxGap, Constants.NEW_ADDED_CUE_DEFAULT_STEP);
        const cues = state.cues;
        const previousCue = cues[idx - 1] || Constants.DEFAULT_CUE;
        const sourceCue = state.sourceCues[idx];
        const cue = createAndAddCue(previousCue, step, sourceCue);
        const overlapCaptionsAllowed = getState().editingTrack?.overlapEnabled;

        if (!overlapCaptionsAllowed) {
            const followingCue = cues[idx];
            applyOverlapPreventionStart(cue.vttCue, previousCue);
            applyOverlapPreventionEnd(cue.vttCue, followingCue);
        }
        const validCueDuration = verifyCueDuration(cue.vttCue, timeGapLimit);

        if (validCueDuration) {
            dispatch(cuesSlice.actions.addCue({ idx, cue }));
            dispatch(lastCueChangeSlice.actions.recordCueChange({ changeType: "ADD", index: idx, vttCue: cue.vttCue }));
            dispatch(scrollPositionSlice.actions.changeScrollPosition(ScrollPosition.CURRENT));
        } else {
            dispatch(validationErrorSlice.actions.setValidationError(true));
        }
    };

export const deleteCue = (idx: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(cuesSlice.actions.deleteCue({ idx }));
        dispatch(lastCueChangeSlice.actions
            .recordCueChange({ changeType: "REMOVE", index: idx, vttCue: new VTTCue(0, 0, "") }));
    };

export const updateCues = (cues: CueDto[]): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CuesAction>>, getState): void => {
        const checkedCues = markCues(
            cues,
            getState().subtitleSpecifications,
            getState().editingTrack?.overlapEnabled
        );
        dispatch(cuesSlice.actions.updateCues({ cues: checkedCues }));
    };

export const updateEditingCueIndex = (idx: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx }));
        if (idx >= 0) {
            dispatch(scrollPositionSlice.actions.changeScrollPosition(ScrollPosition.CURRENT));
        }
    };

export const updateSourceCues = (cues: CueDto[]): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CuesAction>>): void => {
        dispatch(sourceCuesSlice.actions.updateSourceCues({ cues }));
    };

export const applyShiftTime = (shiftTime: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<number>>): void => {
        dispatch(cuesSlice.actions.applyShiftTime(shiftTime));
    };

export const setValidationError = (error: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean>>): void => {
        dispatch(validationErrorSlice.actions.setValidationError(error));
    };

export const syncCues = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CuesAction>>, getState): void => {
        const cues = getState().sourceCues;
        if (cues && cues.length > 0) {
            dispatch(cuesSlice.actions.syncCues({ cues }));
        }
    };
