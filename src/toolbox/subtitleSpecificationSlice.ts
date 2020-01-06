import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {SubtitleSpecification} from "../toolbox/model";
import {Dispatch} from "react";
import {AppThunk} from "../reducers/subtitleEditReducers";

interface SubtitleSpecificationAction {
    subtitleSpecification: SubtitleSpecification;
}

export const subtitleSpecificationSlice = createSlice({
    name: "subtitleSpecification",
    initialState: null as SubtitleSpecification | null,
    reducers: {
        readSubtitleSpecification: (_state, action: PayloadAction<SubtitleSpecificationAction>): SubtitleSpecification =>
            action.payload.subtitleSpecification,
    }
});

export const readSubtitleSpecification = (subtitleSpecification: SubtitleSpecification): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleSpecificationAction>>): void => {
        dispatch(subtitleSpecificationSlice.actions.readSubtitleSpecification({ subtitleSpecification }));
    };
