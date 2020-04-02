import { CueCategory, CueDto, SubtitleEditAction } from "../model";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../subtitleEditReducers";
import { Dispatch } from "react";
import { copyNonConstructorProperties } from "./cueUtils";
import { Constants } from "../constants";
import { SubtitleSpecification } from "../toolbox/model";

export interface CueIndexAction extends SubtitleEditAction {
    idx: number;
}

export interface VttCueAction extends CueIndexAction {
    vttCue: VTTCue;
    subtitleSpecification: SubtitleSpecification | null;
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

interface TimeGapLimit {
    minGap: number;
    maxGap: number;
}

const getTimeGapLimits = (subtitleSpecs: SubtitleSpecification | null): TimeGapLimit => {
    let minGap: number = Constants.DEFAULT_MIN_GAP;
    let maxGap: number = Constants.DEFAULT_MAX_GAP;

    if (subtitleSpecs?.enabled) {
        minGap = subtitleSpecs.minCaptionDurationInMillis / 1000;
        maxGap = subtitleSpecs.maxCaptionDurationInMillis / 1000;
    }

    return { minGap, maxGap };
};


const applyInvalidRangePrevention = (timeGapLimit: TimeGapLimit, vttCue: VTTCue, originalCue: CueDto): void => {
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

const applyOverlapPrevention = (vttCue: VTTCue,
                                previousCue: CueDto,
                                followingCue: CueDto): void => {
    if (vttCue.startTime < previousCue?.vttCue.endTime) {
        vttCue.startTime = previousCue.vttCue.endTime;
    }
    if (vttCue.endTime > followingCue?.vttCue.startTime) {
        vttCue.endTime = followingCue.vttCue.startTime;
    }
};

const verifyNoOverlapOnAddCue = (cue: CueDto, index: number, currentCues: CueDto[]): boolean =>
    index === currentCues.length
    || (Number((currentCues[index]?.vttCue?.startTime - cue.vttCue.endTime).toFixed(3)) >= Constants.HALF_SECOND);


export const cuesSlice = createSlice({
    name: "cues",
    initialState: [] as CueDto[],
    reducers: {
        updateVttCue: (state, action: PayloadAction<VttCueAction>): void => {
            const cueCategory = state[action.payload.idx]
                ? state[action.payload.idx].cueCategory
                : "DIALOGUE";
            const previousCue = state[action.payload.idx - 1];
            const followingCue = state[action.payload.idx + 1];
            const originalCue = state[action.payload.idx];

            const vttCue = action.payload.vttCue;
            const subtitleSpecification = action.payload.subtitleSpecification;

            const timeGapLimit: TimeGapLimit = getTimeGapLimits(subtitleSpecification);

            applyOverlapPrevention(vttCue, previousCue, followingCue);
            applyInvalidRangePrevention(timeGapLimit, vttCue, originalCue);

            state[action.payload.idx] = { vttCue, cueCategory };
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
            const cue = action.payload.cue;
            const idx = action.payload.idx;

            if (verifyNoOverlapOnAddCue(cue, idx, state)) {
                state.splice(idx, 0, cue);
            }
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
            (_state, action: PayloadAction<CueIndexAction>): number => {
                 console.log(_state);
                 console.log(action);

                return action.payload.idx;
            },
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
        dispatch(cuesSlice.actions.updateVttCue({
            idx,
            vttCue,
            subtitleSpecification: getState().subtitleSpecifications
        }));
    };

export const updateCueCategory = (idx: number, cueCategory: CueCategory): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueCategoryAction>>): void => {
        dispatch(cuesSlice.actions.updateCueCategory({ idx, cueCategory }));
    };

export const addCue = (idx: number, cue: CueDto): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueAction>>, _getState): void => {
            dispatch(cuesSlice.actions.addCue({ idx, cue }));
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

const ADD_END_TIME_INTERVAL_SECS = 3;
export const createAndAddCue = (previousCue: CueDto, index: number, sourceCue?: CueDto): AppThunk => {
    const startTime = sourceCue
        ? sourceCue.vttCue.startTime
        : previousCue.vttCue.endTime;
    const endTime = sourceCue
        ? sourceCue.vttCue.endTime
        : previousCue.vttCue.endTime + ADD_END_TIME_INTERVAL_SECS;
    const newCue = new VTTCue(startTime, endTime, "");
    copyNonConstructorProperties(newCue, previousCue.vttCue);
    const cue = { vttCue: newCue, cueCategory: previousCue.cueCategory };
    return addCue(index, cue);
};
