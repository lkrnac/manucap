import { CueCategory, CueDto, SubtitleEditAction } from "../model";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "../subtitleEditReducers";
import { Dispatch } from "react";

export interface CueIndexAction extends SubtitleEditAction {
    idx: number;
}

export interface VttCueAction extends CueIndexAction {
    vttCue: VTTCue;
}

export interface CueCategoryAction extends CueIndexAction {
    cueCategory: CueCategory;
}

export interface AddVttCueAction extends VttCueAction {
    cueCategory: CueCategory;
}

interface CuesAction extends SubtitleEditAction {
    cues: CueDto[];
}

export const cuesSlice = createSlice({
    name: "cues",
    initialState: [] as CueDto[],
    reducers: {
        updateVttCue: (state, action: PayloadAction<VttCueAction>): void => {
            const cueCategory = state[action.payload.idx]
                ? state[action.payload.idx].cueCategory
                : "DIALOGUE";
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
        addCue: (state, action: PayloadAction<AddVttCueAction>): void => {
            const newCueDto = { vttCue: action.payload.vttCue, cueCategory: action.payload.cueCategory };
            state.splice(action.payload.idx, 0, newCueDto);
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
        updateCues: (_state, action: PayloadAction<CuesAction>): CueDto[] => action.payload.cues
    }
});

export const editingCueIndexSlice = createSlice({
    name: "editingCueIndex",
    initialState: 0,
    reducers: {
        updateEditingCueIndex: (_state, action: PayloadAction<CueIndexAction>): number => action.payload.idx,
    },
    extraReducers: {
        [cuesSlice.actions.addCue.type]:
            (_state, action: PayloadAction<VttCueAction>): number => action.payload.idx,
        [cuesSlice.actions.deleteCue.type]:
            (_state, action: PayloadAction<CueIndexAction>): number => action.payload.idx - 1,
        [cuesSlice.actions.updateCues.type]:
            (_state, action: PayloadAction<CuesAction>): number => action.payload.cues.length - 1,

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

export const addCue = (idx: number, vttCue: VTTCue, cueCategory: CueCategory): AppThunk =>
    (dispatch: Dispatch<PayloadAction<AddVttCueAction>>): void => {
        dispatch(cuesSlice.actions.addCue({ idx, vttCue, cueCategory }));
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
