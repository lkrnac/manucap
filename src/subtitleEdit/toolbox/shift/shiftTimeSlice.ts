import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "../../subtitleEditReducers";
import { Dispatch } from "react";


export const shiftTimeSlice = createSlice({
    name: "shiftTime",
    initialState: 0 as number,
    reducers: {
        applyShitTime:
            (_state, action: PayloadAction<number>): number =>
            {
                console.log(action);
                return action.payload;
            }
    }
});

export const applyShitTime = (shiftTime: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<number>>): void => {
        dispatch(shiftTimeSlice.actions.applyShitTime(shiftTime));
    };
