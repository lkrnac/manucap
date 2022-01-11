import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const waveformVisibleSlice = createSlice({
    name: "waveformVisible",
    initialState: true,
    reducers: {
        setWaveformVisible: (_state, action: PayloadAction<boolean>): boolean => action.payload
    },
    extraReducers: {}
});
