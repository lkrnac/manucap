import { CueCategory, CueDto, SubtitleEditAction } from "../model";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, SubtitleEditState } from "../subtitleEditReducers";
import { Dispatch } from "react";
import {
    constructCueValuesArray,
    copyNonConstructorProperties,
} from "./cueUtils";
import { Constants } from "../constants";
import { editingTrackSlice } from "../trackSlices";
import { SubtitleSpecificationAction, subtitleSpecificationSlice } from "../toolbox/subtitleSpecificationSlice";
import {
    applyCharacterLimitation,
    applyInvalidRangePreventionEnd,
    applyInvalidRangePreventionStart,
    applyOverlapPreventionEnd,
    applyOverlapPreventionStart, getTimeGapLimits,
    markCuesBreakingRules,
    verifyCueDuration
} from "./cueVerifications";
import { debounce } from "lodash";

export interface CueIndexAction extends SubtitleEditAction {
    idx: number;
}

export interface VttCueAction extends CueIndexAction {
    vttCue: VTTCue;
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

const areCuesEqual = (x: VTTCue, y: VTTCue): boolean => {
    return JSON.stringify(constructCueValuesArray(x)) === JSON.stringify(constructCueValuesArray(y));
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
    return { vttCue: newCue, cueCategory: previousCue.cueCategory };
};

export const cuesSlice = createSlice({
    name: "cues",
    initialState: [] as CueDto[],
    reducers: {
        updateVttCue: (state, action: PayloadAction<VttCueAction>): void => {
            const cueCategory = state[action.payload.idx].cueCategory;
            state[action.payload.idx] = { vttCue: action.payload.vttCue, cueCategory };
        },
        updateCueCategory: (state, action: PayloadAction<CueCategoryAction>): void => {
            if (state[action.payload.idx]) {
                state[action.payload.idx] = {
                    vttCue: state[action.payload.idx].vttCue,
                    cueCategory: action.payload.cueCategory
                };
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
                state[0] = {
                    vttCue: new VTTCue(0, 3, ""),
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
        checkErrors: (state, action: PayloadAction<SubtitleSpecificationAction>): CueDto[] =>
            markCuesBreakingRules(state, action.payload.subtitleSpecification, action.payload.overlapCaptions)
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CueDto[] => [],
        [subtitleSpecificationSlice.actions.readSubtitleSpecification.type]:
            (state, action: PayloadAction<SubtitleSpecificationAction>): CueDto[] =>
                markCuesBreakingRules(state, action.payload.subtitleSpecification, action.payload.overlapCaptions),
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

const DEBOUNCE_TIMEOUT = 500;

export const saveTrackSlice = createSlice({
    name: "saveTrack",
    initialState: null as Function | null,
    reducers: {
        set: (_state, action: PayloadAction<Function>): void => {
            // @ts-ignore debounce expects any type
            return debounce(action.payload, DEBOUNCE_TIMEOUT);
        },
        call: (state): void => state ? state() : null,
    },
    extraReducers: {
        [cuesSlice.actions.applyShiftTime.type]: (state): void => state ? state() : null,
        [cuesSlice.actions.updateCueCategory.type]: (state): void => state ? state() : null,
        [cuesSlice.actions.deleteCue.type]: (state): void => state ? state() : null,
    }
});

export const overlapCaptionsSlice = createSlice({
    name: "overlapCaptions",
    initialState: false,
    reducers: {
        setOverlapCaptions: (_state, action: PayloadAction<boolean>): boolean => action.payload
    }
});

export const updateVttCue = (idx: number, vttCue: VTTCue): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        const newVttCue = new VTTCue(vttCue.startTime, vttCue.endTime, vttCue.text);
        copyNonConstructorProperties(newVttCue, vttCue);

        const cues = getState().cues;
        const previousCue = cues[idx - 1];
        const followingCue = cues[idx + 1];
        const originalCue = cues[idx];
        const subtitleSpecifications = getState().subtitleSpecifications;
        const overlapCaptionsAllowed = getState().overlapCaptions;

        if (vttCue.startTime !== originalCue.vttCue.startTime) {
            overlapCaptionsAllowed || applyOverlapPreventionStart(newVttCue, previousCue);
            applyInvalidRangePreventionStart(newVttCue, subtitleSpecifications);
        }
        if (vttCue.endTime !== originalCue.vttCue.endTime) {
            overlapCaptionsAllowed || applyOverlapPreventionEnd(newVttCue, followingCue);
            applyInvalidRangePreventionEnd(newVttCue, subtitleSpecifications);
        }
        applyCharacterLimitation(newVttCue, originalCue, subtitleSpecifications);

        if (!areCuesEqual(vttCue, newVttCue)) {
            dispatch(validationErrorSlice.actions.setValidationError(true));
        }

        dispatch(cuesSlice.actions.updateVttCue({ idx, vttCue: newVttCue }));
        dispatch(cuesSlice.actions.checkErrors({
            subtitleSpecification: subtitleSpecifications,
            overlapCaptions: overlapCaptionsAllowed
        }));
    };

export const updateCueCategory = (idx: number, cueCategory: CueCategory): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueCategoryAction>>): void => {
        dispatch(cuesSlice.actions.updateCueCategory({ idx, cueCategory }));
    };

export const addCue = (idx: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueAction | boolean>>, getState): void => {
        const state: SubtitleEditState = getState();
        const subtitleSpecifications = state.subtitleSpecifications;
        const timeGapLimit = getTimeGapLimits(subtitleSpecifications);
        const step = Math.min(timeGapLimit.maxGap, Constants.NEW_ADDED_CUE_DEFAULT_STEP);
        const cues = state.cues;
        const previousCue = cues[idx - 1] || Constants.DEFAULT_CUE;
        const sourceCue = state.sourceCues[idx];
        const cue = createAndAddCue(previousCue, step, sourceCue);
        const overlapCaptionsAllowed = getState().overlapCaptions;

        if (!overlapCaptionsAllowed) {
            const followingCue = cues[idx];
            applyOverlapPreventionStart(cue.vttCue, previousCue);
            applyOverlapPreventionEnd(cue.vttCue, followingCue);
        }
        const validCueDuration = verifyCueDuration(cue.vttCue, timeGapLimit);

        if (validCueDuration) {
            dispatch(cuesSlice.actions.addCue({ idx, cue }));
        } else {
            dispatch(validationErrorSlice.actions.setValidationError(true));
        }
    };

export const deleteCue = (idx: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueIndexAction>>): void => {
        dispatch(cuesSlice.actions.deleteCue({ idx }));
    };

export const updateCues = (cues: CueDto[]): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CuesAction>>, getState): void => {
        const checkedCues = markCuesBreakingRules(
            cues,
            getState().subtitleSpecifications,
            getState().overlapCaptions
        );
        dispatch(cuesSlice.actions.updateCues({ cues: checkedCues }));
    };

export const updateEditingCueIndex = (idx: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueIndexAction>>): void => {
        dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx }));
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

export const setSaveTrack = (saveTrack: Function): AppThunk =>
    (dispatch: Dispatch<PayloadAction<Function>>): void => {
        dispatch(saveTrackSlice.actions.set(saveTrack));
    };

export const callSaveTrack = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<void>>): void => {
        dispatch(saveTrackSlice.actions.call());
    };

export const setOverlapCaptions = (overlap: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean>>): void => {
        dispatch(overlapCaptionsSlice.actions.setOverlapCaptions(overlap));
    };
