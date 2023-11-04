import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "../../manuCapReducers";
import { Dispatch } from "react";
import { CaptionSpecification } from "../model";
import { ManuCapAction } from "../../model";

export interface CaptionSpecificationAction extends ManuCapAction{
    subtitleSpecification: CaptionSpecification | null;
}

export const subtitleSpecificationSlice = createSlice({
    name: "subtitleSpecification",
    initialState: null as CaptionSpecification | null,
    reducers: {
        readCaptionSpecification:
            (_state, action: PayloadAction<CaptionSpecificationAction>): CaptionSpecification | null =>
                action.payload.subtitleSpecification,
    }
});

export const readCaptionSpecification = (subtitleSpecification: CaptionSpecification): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CaptionSpecificationAction>>): void => {
        dispatch(subtitleSpecificationSlice.actions.readCaptionSpecification({ subtitleSpecification }));
    };
