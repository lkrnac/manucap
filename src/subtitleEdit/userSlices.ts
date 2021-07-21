import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { User } from "./model";
import { AppThunk } from "./subtitleEditReducers";
import { Dispatch } from "react";

export interface UserAction {
    currentUser: User
}

export const userSlice = createSlice({
    name: "currentUser",
    initialState: null as User | null,
    reducers: {
        updateUser: (_state, action: PayloadAction<UserAction>): User =>
            action.payload.currentUser
    }
});

export const updateUser = (currentUser: User): AppThunk =>
    (dispatch: Dispatch<PayloadAction<UserAction>>): void => {
        dispatch(userSlice.actions.updateUser({ currentUser }));
    }
