import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SubtitleEditAction, User } from "./model";
// import { AppThunk } from "./subtitleEditReducers";
// import { Dispatch } from "react";

export interface UserAction extends SubtitleEditAction {
    subtitleUser: User;
}

export const userSlice = createSlice({
    name: "subtitleUser",
    initialState: null as User | null,
    reducers: {
        updateSubtitleUser: (_state, action: PayloadAction<UserAction>): User =>
            action.payload.subtitleUser
    }
});
