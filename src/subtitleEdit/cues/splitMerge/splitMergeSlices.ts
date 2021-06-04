import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { editingTrackSlice } from "../../trackSlices";
import { SplitMerge } from "./model";
import { AppThunk } from "../../subtitleEditReducers";
import { Dispatch } from "react";
import { SubtitleEditAction } from "../../model";

export const splitMergeVisibleSlice = createSlice({
    name: "splitMergeVisible",
    initialState: false,
    reducers: {
        setSplitMergeVisible: (_state, action: PayloadAction<boolean>): boolean => action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): boolean => false
        // TODO: try to set to false after merge
    }
});

const initialSearchReplace = {
    type: "SPLIT",
    startCueIndex: -1,
    endCueIndex: -1
} as SplitMerge;

export const splitMergeSlice = createSlice({
    name: "splitMerge",
    initialState: initialSearchReplace,
    reducers: {
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): SplitMerge => initialSearchReplace,
        [splitMergeVisibleSlice.actions.setSplitMergeVisible.type]:
            (_state, action: PayloadAction<boolean>): SplitMerge =>
                action.payload ? _state : initialSearchReplace
    }
});

export const showSplitMerge = (visible: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean | SubtitleEditAction>>): void => {
        dispatch(splitMergeVisibleSlice.actions.setSplitMergeVisible(visible));
    };
