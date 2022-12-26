import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CueChange, CueError, ScrollPosition, SubtitleEditAction } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";
import { changeScrollPosition } from "../cuesList/cuesListScrollSlice";
import { cuesSlice } from "../cuesList/cuesListSlices";
import { editingTrackSlice } from "../../trackSlices";
import { mergeVisibleSlice } from "../merge/mergeSlices";
import { updateMatchedCues } from "../cuesList/cuesListActions";
import { updateSearchMatches } from "../searchReplace/searchReplaceSlices";

export interface CueIndexAction extends SubtitleEditAction {
    idx: number;
}

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
        [mergeVisibleSlice.actions.setMergeVisible.type]: (): number => -1
    }
});

type FocusedInputType = "EDITOR" | "START_TIME";

export const focusedInputSlice = createSlice({
    name: "focusedInput",
    initialState: "EDITOR" as FocusedInputType,
    reducers: {
        updateFocusedInput: (_state, action: PayloadAction<FocusedInputType>): FocusedInputType => action.payload
    }
});

export const updateEditingCueIndexNoThunk = (
    dispatch: Dispatch<SubtitleEditAction>,
    getState: Function,
    idx: number
): void => {
    dispatch(focusedInputSlice.actions.updateFocusedInput("EDITOR"));
    dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx }));
    if (idx >= 0) {
        const state = getState();
        if (state.searchReplaceVisible) {
            const cue = getState().cues[idx];
            updateSearchMatches(dispatch, getState, cue);
        }
        // TODO: check if it's needed
        dispatch(updateMatchedCues());
        dispatch(changeScrollPosition(ScrollPosition.CURRENT));
    }
};

// TODO: check if updateEditingCueIndexNoThunk can be called directly
export const updateEditingCueIndex = (idx: number): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        updateEditingCueIndexNoThunk(dispatch, getState, idx);
    };

export const validationErrorSlice = createSlice({
    name: "validationError",
    initialState: [] as CueError[],
    reducers: {
        setValidationErrors: (_state, action: PayloadAction<CueError[]>): CueError[] => action.payload
    },
    extraReducers: {
        [editingCueIndexSlice.actions.updateEditingCueIndex.type]: (): CueError[] => []
    }
});

export const setValidationErrors = (errors: CueError[]): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueError[]>>): void => {
        dispatch(validationErrorSlice.actions.setValidationErrors(errors));
    };

export const lastCueChangeSlice = createSlice({
    name: "lastCueChange",
    initialState: null as CueChange | null,
    reducers: {
        recordCueChange: (_state, action: PayloadAction<CueChange | null>): CueChange | null =>
            action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CueChange | null => null
    }
});

export const clearLastCueChange = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueChange | null>>): void => {
        dispatch(lastCueChangeSlice.actions.recordCueChange(null));
    };





