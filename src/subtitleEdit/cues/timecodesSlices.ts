import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { editingTrackSlice } from "../trackSlices";

export const timecodesLockSlice = createSlice({
    name: "timecodesUnlocked",
    initialState: false,
    reducers: {
        unlockTimecodes: (_state, action: PayloadAction<boolean>): boolean => action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): boolean => false
    }
});
