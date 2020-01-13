import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "../reducers/subtitleEditReducers";
import { Dispatch } from "react";
import { SubtitleSpecification } from "./model";

interface SubtitleSpecificationAction {
    subtitleSpecification: SubtitleSpecification;
}

export const subtitleSpecificationSlice = createSlice({
    name: "subtitleSpecification",
    initialState: null as SubtitleSpecification | null,
    reducers: {
        readSubtitleSpecification:
            (_state, action: PayloadAction<SubtitleSpecificationAction>): SubtitleSpecification =>
                action.payload.subtitleSpecification,
    }
});

export const readSubtitleSpecification = (subtitleSpecification: SubtitleSpecification): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleSpecificationAction>>): void => {
        dispatch(subtitleSpecificationSlice.actions.readSubtitleSpecification({ subtitleSpecification }));
    };
