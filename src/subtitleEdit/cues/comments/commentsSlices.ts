import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { SubtitleEditAction } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";
import { editingTrackSlice } from "../../trackSlices";

export const commentsVisibleSlice = createSlice({
    name: "commentsVisible",
    initialState: false,
    reducers: {
        setCommentsVisible: (_state, action: PayloadAction<boolean>): boolean => action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): boolean => false
    }
});

export const showComments = (visible: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean | SubtitleEditAction>>): void => {
        dispatch(commentsVisibleSlice.actions.setCommentsVisible(visible));
    };
