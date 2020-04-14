import { CueCategory, CueDto, SubtitleEditAction, TimeGapLimit } from "../model";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../subtitleEditReducers";
import { Dispatch } from "react";
import { checkCharacterLimitation, copyNonConstructorProperties, getTimeGapLimits } from "./cueUtils";
import { SubtitleSpecification } from "../toolbox/model";
import { Constants } from "../constants";

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
    return x.text === y.text && x.startTime === y.startTime && x.endTime === y.endTime;
};

const minRangeOk = (vttCue: VTTCue, timeGapLimit: TimeGapLimit): boolean =>
    (vttCue.endTime - vttCue.startTime) >= timeGapLimit.minGap;

const maxRangeOk = (vttCue: VTTCue, timeGapLimit: TimeGapLimit): boolean =>
    (vttCue.endTime - vttCue.startTime) <= timeGapLimit.maxGap;

const startOverlapOk = (vttCue: VTTCue, previousCue: CueDto): boolean =>
    !previousCue || vttCue.startTime >= previousCue.vttCue.endTime;

const endOverlapOk = (vttCue: VTTCue, followingCue: CueDto): boolean =>
    !followingCue || vttCue.endTime <= followingCue.vttCue.startTime;

const applyInvalidRangePrevention = (vttCue: VTTCue,
                                     originalCue: CueDto,
                                     subtitleSpecification: SubtitleSpecification | null): void => {

    const timeGapLimit = getTimeGapLimits(subtitleSpecification);

    const startTimeChange: boolean = vttCue.startTime !== originalCue.vttCue.startTime;
    const endTimeChange: boolean = vttCue.endTime !== originalCue.vttCue.endTime;

    if (!minRangeOk(vttCue, timeGapLimit)) {
        vttCue.startTime = startTimeChange ?
            Number((vttCue.endTime - timeGapLimit.minGap).toFixed(3)) : vttCue.startTime;
        vttCue.endTime = endTimeChange ?
            Number((vttCue.startTime + timeGapLimit.minGap).toFixed(3)) : vttCue.endTime;
    }
    if (!maxRangeOk(vttCue, timeGapLimit)) {
        vttCue.startTime = startTimeChange ?
            Number((vttCue.endTime - timeGapLimit.maxGap).toFixed(3)) : vttCue.startTime;
        vttCue.endTime = endTimeChange ?
            Number((vttCue.startTime + timeGapLimit.maxGap).toFixed(3)) : vttCue.endTime;
    }
};

const applyOverlapPrevention = (
    vttCue: VTTCue,
    previousCue: CueDto,
    followingCue: CueDto
): void => {
    if (!startOverlapOk(vttCue, previousCue)) {
        vttCue.startTime = previousCue.vttCue.endTime;
    }
    if (!endOverlapOk(vttCue, followingCue)) {
        vttCue.endTime = followingCue.vttCue.startTime;
    }
};

const verifyCueDuration = (vttCue: VTTCue,
                                 timeGapLimit: TimeGapLimit): boolean => {
    const cueDuration = Number((vttCue.endTime - vttCue.startTime).toFixed(3));
    return cueDuration >= timeGapLimit.minGap;
};

const applyCharacterLimitation = (
    vttCue: VTTCue,
    originalCue: CueDto,
    subtitleSpecifications: SubtitleSpecification | null
): VTTCue => {
    if (!checkCharacterLimitation(vttCue.text, subtitleSpecifications)) {
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
        }
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
    }
});

export const validationErrorSlice = createSlice({
    name: "validationError",
    initialState: false,
    reducers: {
        setValidationError: (_state, action: PayloadAction<boolean>): boolean => action.payload
    }
});

export const updateVttCue = (idx: number, vttCue: VTTCue): AppThunk =>
    (dispatch: Dispatch<PayloadAction<VttCueAction | boolean>>, getState): void => {
        const newVttCue = new VTTCue(vttCue.startTime, vttCue.endTime, vttCue.text);
        copyNonConstructorProperties(newVttCue, vttCue);

        const cues = getState().cues;
        const previousCue = cues[idx - 1];
        const followingCue = cues[idx + 1];
        const originalCue = cues[idx];
        const subtitleSpecifications = getState().subtitleSpecifications;

        applyOverlapPrevention(newVttCue, previousCue, followingCue);
        applyCharacterLimitation(newVttCue, originalCue, subtitleSpecifications);
        applyInvalidRangePrevention(newVttCue, originalCue, subtitleSpecifications);

        if (!areCuesEqual(vttCue, newVttCue)) {
            dispatch(validationErrorSlice.actions.setValidationError(true));
        }

        dispatch(cuesSlice.actions.updateVttCue({ idx, vttCue: newVttCue }));
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
        const originalCue = new VTTCue(cue.vttCue.startTime, cue.vttCue.endTime, cue.vttCue.text);
        applyOverlapPrevention(cue.vttCue, previousCue, followingCue);
        const validCueDuration = verifyCueDuration(cue.vttCue, timeGapLimit);

        if (!validCueDuration || !areCuesEqual(originalCue, cue.vttCue)) {
            dispatch(validationErrorSlice.actions.setValidationError(true));
        }
        if (validCueDuration) {
            dispatch(cuesSlice.actions.addCue({ idx, cue }));
        }
    };

export const deleteCue = (idx: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueIndexAction>>): void => {
        dispatch(cuesSlice.actions.deleteCue({ idx }));
    };

export const updateCues = (cues: CueDto[]): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CuesAction>>): void => {
        dispatch(cuesSlice.actions.updateCues({ cues }));
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
