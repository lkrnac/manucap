import { createSlice, PayloadAction, Dispatch } from "@reduxjs/toolkit";
import { ScrollPosition } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";

export const scrollPositionSlice = createSlice({
    name: "scrollPosition",
    initialState: ScrollPosition.NONE,
    reducers: {
        changeScrollPosition: (_state, action: PayloadAction<ScrollPosition>): ScrollPosition => action.payload
    }
});

export const changeScrollPosition = (scrollPosition: ScrollPosition): AppThunk =>
    (dispatch: Dispatch<PayloadAction<ScrollPosition>>): void => {
        dispatch(scrollPositionSlice.actions.changeScrollPosition(scrollPosition));
    };
