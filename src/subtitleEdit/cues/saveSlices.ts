import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { debounce } from "lodash";
import { AppThunk } from "../subtitleEditReducers";
import { Dispatch } from "react";
import { CueDto } from "../model";

const DEBOUNCE_TIMEOUT = 2500;
export const SAVING_CHANGES_MSG = "Saving changes ...";
export const CHANGES_SAVED_MSG = "All changes saved to server";
export const ERROR_SAVING_MSG = "Error saving latest changes";

export const autoSaveSuccessSlice = createSlice({
    name: "autoSaveSuccess",
    initialState: false,
    reducers: {
        setAutoSaveSuccess: (_state, action: PayloadAction<boolean>): boolean => action.payload
    }
});

export const saveTrackSlice = createSlice({
    name: "saveTrack",
    initialState: null as Function | null,
    reducers: {
        set: (_state, action: PayloadAction<Function>): Function =>
            // @ts-ignore debounce expects any type
            debounce(action.payload, DEBOUNCE_TIMEOUT, { leading: false, trailing: true }),
        call: (state, action: PayloadAction<CueDto[]>): void => state ? state(action.payload) : null,
    },
    extraReducers: {
        [autoSaveSuccessSlice.actions.setAutoSaveSuccess.type]: (state, action: PayloadAction<boolean>): void => {
            if (!action.payload && state) {
                state();
            }
        }
    }
});

export const saveStatusSlice = createSlice({
    name: "saveStatus",
    initialState: "",
    reducers: {},
    extraReducers: {
        [saveTrackSlice.actions.call.type]: (): string => SAVING_CHANGES_MSG,
        [autoSaveSuccessSlice.actions.setAutoSaveSuccess.type]: (_state, action: PayloadAction<boolean>): string =>
            action.payload ? CHANGES_SAVED_MSG : ERROR_SAVING_MSG
    }
});

export const pendingSaveSlice = createSlice({
    name: "pendingSave",
    initialState: false,
    reducers: {
        setPendingSave: (_state, action: PayloadAction<boolean>): boolean => action.payload
    }
});

export const setSaveTrack = (saveTrack: Function): AppThunk =>
    (dispatch: Dispatch<PayloadAction<Function>>): void => {
        dispatch(saveTrackSlice.actions.set(saveTrack));
    };

export const setAutoSaveSuccess = (success: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean | CueDto[]>>, getState): void => {
        dispatch(autoSaveSuccessSlice.actions.setAutoSaveSuccess(success));
        const pendingSave = getState().pendingSave;
        if (pendingSave) {
            const cues = getState().cues;
            dispatch(saveTrackSlice.actions.call(cues));
            dispatch(pendingSaveSlice.actions.setPendingSave(false));
        }
    };

export const callSaveTrack = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueDto[] | boolean>>, getState): void => {
        const saveStatus = getState().saveStatus;
        if (saveStatus !== SAVING_CHANGES_MSG) {
            const cues = getState().cues;
            dispatch(saveTrackSlice.actions.call(cues));
        } else {
            dispatch(pendingSaveSlice.actions.setPendingSave(true));
        }
    };
