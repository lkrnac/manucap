import { CueCategory, CueDto, CuesState, SubtitleEditAction, TimeGapLimit } from "../model";
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
    subtitleSpecifications: SubtitleSpecification | null;
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

const applyInvalidRangePrevention = (vttCue: VTTCue,
                                     originalCue: CueDto,
                                     subtitleSpecification: SubtitleSpecification | null): void => {

    const timeGapLimit = getTimeGapLimits(subtitleSpecification);
    const isOutOfMinRange: boolean = (vttCue.endTime - vttCue.startTime) < timeGapLimit.minGap;
    const isOutOfMaxRange: boolean = (vttCue.endTime - vttCue.startTime) > timeGapLimit.maxGap;

    const startTimeChange: boolean = vttCue.startTime !== originalCue.vttCue.startTime;
    const endTimeChange: boolean = vttCue.endTime !== originalCue.vttCue.endTime;

    if (isOutOfMinRange) {
        vttCue.startTime = startTimeChange ?
            Number((vttCue.endTime - timeGapLimit.minGap).toFixed(3)) : vttCue.startTime;
        vttCue.endTime = endTimeChange ?
            Number((vttCue.startTime + timeGapLimit.minGap).toFixed(3)) : vttCue.endTime;
    }
    if (isOutOfMaxRange) {
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
    if (vttCue.startTime < previousCue?.vttCue.endTime) {
        vttCue.startTime = previousCue.vttCue.endTime;
    }
    if (vttCue.endTime > followingCue?.vttCue.startTime) {
        vttCue.endTime = followingCue.vttCue.startTime;
    }
};

const verifyNoOverlapOnAddCue = (cue: CueDto, index: number,
                                 currentCues: CueDto[],
                                 timeGapLimit: TimeGapLimit): boolean => {
    const following = currentCues[index];
    const vttCue = cue.vttCue;

    if (vttCue.endTime > following?.vttCue.startTime) {
        vttCue.endTime = following.vttCue.startTime;
    }
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
    name: "cuesState",
    initialState: { cues: [], loaded: false } as CuesState,
    reducers: {
        updateVttCue: (state, action: PayloadAction<VttCueAction>): void => {
            const oldVttCue = action.payload.vttCue;
            const newVttCue = new VTTCue(oldVttCue.startTime, oldVttCue.endTime, oldVttCue.text);
            copyNonConstructorProperties(newVttCue, oldVttCue);
            const cues = state.cues;
            const cueCategory = cues[action.payload.idx].cueCategory;

            const previousCue = cues[action.payload.idx - 1];
            const followingCue = cues[action.payload.idx + 1];
            const originalCue = cues[action.payload.idx];
            const subtitleSpecification = action.payload.subtitleSpecifications;

            applyOverlapPrevention(newVttCue, previousCue, followingCue);
            applyCharacterLimitation(newVttCue, originalCue, subtitleSpecification);
            applyInvalidRangePrevention(newVttCue, originalCue, subtitleSpecification);


            cues[action.payload.idx] = { vttCue: newVttCue, cueCategory };
        },
        updateCueCategory: (state, action: PayloadAction<CueCategoryAction>): void => {
            const cues = state.cues;
            if (cues[action.payload.idx]) {
                cues[action.payload.idx] = {
                    vttCue: cues[action.payload.idx].vttCue,
                    cueCategory: action.payload.cueCategory
                };
            }
        },
        addCue: (state, action: PayloadAction<CueAction>): void => {
            state.cues.splice(action.payload.idx, 0, action.payload.cue);
        },
        deleteCue: (state, action: PayloadAction<CueIndexAction>): void => {
            const cues = state.cues;
            if (cues.length > 1) {
                cues.splice(action.payload.idx, 1);
            } else {
                // default empty cue
                cues[0] = {
                    vttCue: new VTTCue(0, 3, ""),
                    cueCategory: "DIALOGUE"
                };
            }
        },
        updateCues: (state, action: PayloadAction<CuesAction>): void => {
            state.cues = action.payload.cues;
            state.loaded = true;
        },
        applyShiftTime: (state, action: PayloadAction<number>): void => {
            const shift = action.payload;
            state.cues = state.cues.map((cue: CueDto) => {
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

export const updateVttCue = (idx: number, vttCue: VTTCue): AppThunk =>
    (dispatch: Dispatch<PayloadAction<VttCueAction>>, getState): void => {
        const subtitleSpecifications = getState().subtitleSpecifications;
        dispatch(cuesSlice.actions.updateVttCue({ idx, vttCue, subtitleSpecifications }));
    };

export const updateCueCategory = (idx: number, cueCategory: CueCategory): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueCategoryAction>>): void => {
        dispatch(cuesSlice.actions.updateCueCategory({ idx, cueCategory }));
    };

export const addCue = (previousCue: CueDto, idx: number, sourceCue?: CueDto): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueAction>>, getState): void => {
        const subtitleSpecifications = getState().subtitleSpecifications;
        const timeGapLimit = getTimeGapLimits(subtitleSpecifications);
        const step = Math.min(timeGapLimit.maxGap, Constants.NEW_ADDED_CUE_DEFAULT_STEP);
        const cue = createAndAddCue(previousCue, step, sourceCue);
        if (verifyNoOverlapOnAddCue(cue, idx, getState().cuesState.cues, timeGapLimit)) {
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
