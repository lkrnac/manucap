import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "../../manuCapReducers";
import { Dispatch } from "react";
import { CaptionSpecification } from "../model";
import { ManuCapAction } from "../../model";

export interface CaptionSpecificationAction extends ManuCapAction{
    captionSpecification: CaptionSpecification | null;
}

export const captionSpecificationSlice = createSlice({
    name: "captionSpecification",
    initialState: null as CaptionSpecification | null,
    reducers: {
        readCaptionSpecification:
            (_state, action: PayloadAction<CaptionSpecificationAction>): CaptionSpecification | null =>
                action.payload.captionSpecification,
    }
});

export const readCaptionSpecification = (captionSpecification: CaptionSpecification): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CaptionSpecificationAction>>): void => {
        dispatch(captionSpecificationSlice.actions.readCaptionSpecification({ captionSpecification }));
    };
