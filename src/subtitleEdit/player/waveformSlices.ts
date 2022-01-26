import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { editingTrackSlice } from "../trackSlices";

export const waveformVisibleSlice = createSlice({
    name: "waveformVisible",
    initialState: false,
    reducers: {
        setWaveformVisible: (_state, action: PayloadAction<boolean>): boolean => action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): boolean => false
    }
});
