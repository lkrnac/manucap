import { CueCategory, CueDto, SubtitleEditAction } from "../model";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../subtitleEditReducers";
import { Dispatch } from "react";
import { copyNonConstructorProperties } from "./cueUtils";

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

const HALF_SECOND = 0.5;

const applyInvalidEndTimePrevention = (vttCue: VTTCue): VTTCue => {
    const maxEndTime = vttCue.startTime + HALF_SECOND;
    if (maxEndTime >= vttCue.endTime) {
        vttCue.endTime = maxEndTime;
    }
    return vttCue;
};

const applyOverlapPrevention = (action: PayloadAction<VttCueAction>, state: CueDto[]): VTTCue => {
    const vttCue = action.payload.vttCue;
    const previousCue = state[action.payload.idx - 1];
    if (previousCue && previousCue.vttCue.endTime > vttCue.startTime) {
        vttCue.startTime = previousCue.vttCue.endTime;
    }
    const followingCue = state[action.payload.idx + 1];
    if (followingCue && followingCue.vttCue.startTime < vttCue.endTime) {
        vttCue.endTime = followingCue.vttCue.startTime;
    }
    return vttCue;
};

const verifyNoOverlapOnAddCue = (cue: CueDto, index: number, currentCues: CueDto[]): boolean =>
    index === currentCues.length
    ||(Number((currentCues[index]?.vttCue?.startTime - cue.vttCue.endTime).toFixed(3)) >= HALF_SECOND);


export const cuesSlice = createSlice({
    name: "cues",
    initialState: [] as CueDto[],
    reducers: {
        updateVttCue: (state, action: PayloadAction<VttCueAction>): void => {
            const cueCategory = state[action.payload.idx]
                ? state[action.payload.idx].cueCategory
                : "DIALOGUE";
            const vttCueWithoutOverlap = applyOverlapPrevention(action, state);
            const vttCue = applyInvalidEndTimePrevention(vttCueWithoutOverlap);
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

export const updateVttCue = (idx: number, vttCue: VTTCue): AppThunk =>
    (dispatch: Dispatch<PayloadAction<VttCueAction>>): void => {
        dispatch(cuesSlice.actions.updateVttCue({ idx, vttCue }));
    };

export const updateCueCategory = (idx: number, cueCategory: CueCategory): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueCategoryAction>>): void => {
        dispatch(cuesSlice.actions.updateCueCategory({ idx, cueCategory }));
    };

export const addCue = (idx: number, cue: CueDto): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueAction>>, getState): void => {
        if(verifyNoOverlapOnAddCue(cue, idx, getState().cues)) {
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
