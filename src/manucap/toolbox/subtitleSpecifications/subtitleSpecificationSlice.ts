import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "../../subtitleEditReducers";
import { Dispatch } from "react";
import { SubtitleSpecification } from "../model";
import { SubtitleEditAction } from "../../model";

export interface SubtitleSpecificationAction extends SubtitleEditAction{
    subtitleSpecification: SubtitleSpecification | null;
}

export const subtitleSpecificationSlice = createSlice({
    name: "subtitleSpecification",
    initialState: null as SubtitleSpecification | null,
    reducers: {
        readSubtitleSpecification:
            (_state, action: PayloadAction<SubtitleSpecificationAction>): SubtitleSpecification | null =>
                action.payload.subtitleSpecification,
    }
});

export const readSubtitleSpecification = (subtitleSpecification: SubtitleSpecification): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleSpecificationAction>>): void => {
        dispatch(subtitleSpecificationSlice.actions.readSubtitleSpecification({ subtitleSpecification }));
    };
