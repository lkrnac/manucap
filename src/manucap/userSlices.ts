import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ManuCapAction, User } from "./model";
import { AppThunk } from "./manuCapReducers";
import { Dispatch } from "react";

export interface UserAction extends ManuCapAction {
    captionUser: User;
}

export const userSlice = createSlice({
    name: "captionUser",
    initialState: null as User | null,
    reducers: {
        updateCaptionUser: (_state, action: PayloadAction<UserAction>): User =>
            action.payload.captionUser
    }
});

export const  updateCaptionUser = (user: User): AppThunk =>
    (dispatch: Dispatch<PayloadAction<UserAction>>): void => {
        dispatch(userSlice.actions.updateCaptionUser({ captionUser: user }));
    };
