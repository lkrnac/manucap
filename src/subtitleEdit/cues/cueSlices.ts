import { CueCategory, CueDto, SubtitleEditAction, TimeGapLimit } from "../model";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../subtitleEditReducers";
import { Dispatch } from "react";
import {
    checkCharacterLimitation,
    constructCueValuesArray,
    copyNonConstructorProperties,
    getTimeGapLimits
} from "./cueUtils";
import { SubtitleSpecification } from "../toolbox/model";
import { Constants } from "../constants";
import { editingTrackSlice } from "../trackSlices";
import { SubtitleSpecificationAction, subtitleSpecificationSlice } from "../toolbox/subtitleSpecificationSlice";

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

const minRangeOk = (vttCue: VTTCue, timeGapLimit: TimeGapLimit): boolean =>
    (vttCue.endTime - vttCue.startTime) >= timeGapLimit.minGap;

const maxRangeOk = (vttCue: VTTCue, timeGapLimit: TimeGapLimit): boolean =>
    (vttCue.endTime - vttCue.startTime) <= timeGapLimit.maxGap;

const rangeOk = (vttCue: VTTCue, subtitleSpecification: SubtitleSpecification | null): boolean => {
    const timeGapLimit = getTimeGapLimits(subtitleSpecification);
    return minRangeOk(vttCue, timeGapLimit) && maxRangeOk(vttCue, timeGapLimit);
};

const startOverlapOk = (vttCue: VTTCue, previousCue: CueDto): boolean =>
    !previousCue || vttCue.startTime >= previousCue.vttCue.endTime;

const endOverlapOk = (vttCue: VTTCue, followingCue: CueDto): boolean =>
    !followingCue || vttCue.endTime <= followingCue.vttCue.startTime;

const overlapOk = (vttCue: VTTCue, previousCue: CueDto, followingCue: CueDto): boolean =>
    startOverlapOk(vttCue, previousCue) && endOverlapOk(vttCue, followingCue);

const conformToRules = (vttCue: VTTCue, subtitleSpecification: SubtitleSpecification | null,
                        previousCue: CueDto, followingCue: CueDto): boolean =>
    checkCharacterLimitation(vttCue.text, subtitleSpecification)
        && rangeOk(vttCue, subtitleSpecification)
        && overlapOk(vttCue, previousCue, followingCue);

const markCuesBreakingRules = (cues: CueDto[], subtitleSpecifications: SubtitleSpecification | null): CueDto [] =>
    cues.map((cue, index) => {
        const previousCue = cues[index - 1];
        const followingCue = cues[index + 1];
        return { ... cue, corrupted: !conformToRules(cue.vttCue, subtitleSpecifications, previousCue, followingCue) };
    });

const applyInvalidRangePreventionStart = (
    vttCue: VTTCue,
    subtitleSpecification: SubtitleSpecification | null
): void => {
    const timeGapLimit = getTimeGapLimits(subtitleSpecification);

    if (!minRangeOk(vttCue, timeGapLimit)) {
        vttCue.startTime = Number((vttCue.endTime - timeGapLimit.minGap).toFixed(3));
    }
    if (!maxRangeOk(vttCue, timeGapLimit)) {
        vttCue.startTime = Number((vttCue.endTime - timeGapLimit.maxGap).toFixed(3));
    }
};

const applyInvalidRangePreventionEnd = (
    vttCue: VTTCue,
    subtitleSpecification: SubtitleSpecification | null
): void => {
    const timeGapLimit = getTimeGapLimits(subtitleSpecification);

    if (!minRangeOk(vttCue, timeGapLimit)) {
        vttCue.endTime = Number((vttCue.startTime + timeGapLimit.minGap).toFixed(3));
    }
    if (!maxRangeOk(vttCue, timeGapLimit)) {
        vttCue.endTime = Number((vttCue.startTime + timeGapLimit.maxGap).toFixed(3));
    }
};

const applyOverlapPreventionStart = (vttCue: VTTCue, previousCue: CueDto): void => {
    if (!startOverlapOk(vttCue, previousCue)) {
        vttCue.startTime = previousCue.vttCue.endTime;
    }
};

const applyOverlapPreventionEnd = (vttCue: VTTCue, followingCue: CueDto): void => {
    if (!endOverlapOk(vttCue, followingCue)) {
        vttCue.endTime = followingCue.vttCue.startTime;
    }
};

const verifyCueDuration = (vttCue: VTTCue, timeGapLimit: TimeGapLimit): boolean => {
    const cueDuration = Number((vttCue.endTime - vttCue.startTime).toFixed(3));
    return cueDuration >= timeGapLimit.minGap;
};

const applyCharacterLimitation = (
    vttCue: VTTCue,
    originalCue: CueDto,
    subtitleSpecifications: SubtitleSpecification | null
): VTTCue => {
    if (!checkCharacterLimitation(vttCue.text, subtitleSpecifications)
        && checkCharacterLimitation(originalCue.vttCue.text, subtitleSpecifications)) {
        vttCue.text = originalCue.vttCue.text;
    }
    return vttCue;
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
            markCuesBreakingRules(state, action.payload.subtitleSpecification)
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CueDto[] => [],
        [subtitleSpecificationSlice.actions.readSubtitleSpecification.type]:
            (state, action: PayloadAction<SubtitleSpecificationAction>): CueDto[] =>
                markCuesBreakingRules(state, action.payload.subtitleSpecification),
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

export const updateVttCue = (idx: number, vttCue: VTTCue): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        const newVttCue = new VTTCue(vttCue.startTime, vttCue.endTime, vttCue.text);
        copyNonConstructorProperties(newVttCue, vttCue);

        const cues = getState().cues;
        const previousCue = cues[idx - 1];
        const followingCue = cues[idx + 1];
        const originalCue = cues[idx];
        const subtitleSpecifications = getState().subtitleSpecifications;

        if (vttCue.startTime !== originalCue.vttCue.startTime) {
            applyOverlapPreventionStart(newVttCue, previousCue);
            applyInvalidRangePreventionStart(newVttCue, subtitleSpecifications);
        }
        if (vttCue.endTime !== originalCue.vttCue.endTime) {
            applyOverlapPreventionEnd(newVttCue, followingCue);
            applyInvalidRangePreventionEnd(newVttCue, subtitleSpecifications);
        }
        applyCharacterLimitation(newVttCue, originalCue, subtitleSpecifications);

        if (!areCuesEqual(vttCue, newVttCue)) {
            dispatch(validationErrorSlice.actions.setValidationError(true));
        }

        dispatch(cuesSlice.actions.updateVttCue({ idx, vttCue: newVttCue }));
        dispatch(cuesSlice.actions.checkErrors({ subtitleSpecification: subtitleSpecifications }));
    };

export const updateCueCategory = (idx: number, cueCategory: CueCategory): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueCategoryAction>>): void => {
        dispatch(cuesSlice.actions.updateCueCategory({ idx, cueCategory }));
    };

export const addCue = (previousCue: CueDto, idx: number, sourceCue?: CueDto): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueAction | boolean>>, getState): void => {
        const subtitleSpecifications = getState().subtitleSpecifications;
        const timeGapLimit = getTimeGapLimits(subtitleSpecifications);
        const step = Math.min(timeGapLimit.maxGap, Constants.NEW_ADDED_CUE_DEFAULT_STEP);
        const cue = createAndAddCue(previousCue, step, sourceCue);

        const followingCue = getState().cues[idx];
        applyOverlapPreventionStart(cue.vttCue, previousCue);
        applyOverlapPreventionEnd(cue.vttCue, followingCue);
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
        const checkedCues = markCuesBreakingRules(cues, getState().subtitleSpecifications);
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
