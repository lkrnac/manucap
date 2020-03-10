import { Dispatch, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "../subtitleEditReducers";
import { SubtitleEditAction } from "../model";

interface ChangePlayerTimeAction extends SubtitleEditAction {
    newTime: number;
}

export const changePlayerTimeSlice = createSlice({
    name: "changePlayerTime",
    initialState: -1,
    reducers: {
        changePlayerTime: (_state, action: PayloadAction<ChangePlayerTimeAction>): number => action.payload.newTime,
    }
});

export const changePlayerTime = (newTime: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(changePlayerTimeSlice.actions.changePlayerTime({ newTime }));
    };