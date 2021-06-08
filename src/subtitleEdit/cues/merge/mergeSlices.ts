import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { editingTrackSlice } from "../../trackSlices";
import { AppThunk } from "../../subtitleEditReducers";
import { Dispatch } from "react";
import { SubtitleEditAction } from "../../model";

export const mergeVisibleSlice = createSlice({
    name: "mergeVisible",
    initialState: false,
    reducers: {
        setMergeVisible: (_state, action: PayloadAction<boolean>): boolean => action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): boolean => false
        // TODO: try to set to false after merge
    }
});

export const showMerge = (visible: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean | SubtitleEditAction>>): void => {
        dispatch(mergeVisibleSlice.actions.setMergeVisible(visible));
    };
