import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SubtitleEditAction, User } from "./model";
// import { AppThunk } from "./subtitleEditReducers";
// import { Dispatch } from "react";

export interface UserAction extends SubtitleEditAction {
    currentUser: User;
}

export const userSlice = createSlice({
    name: "currentUser",
    initialState: null as User | null,
    reducers: {
        updateCurrentUser: (_state, action: PayloadAction<UserAction>): User =>
            action.payload.currentUser
    }
});
