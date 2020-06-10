import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { debounce } from "lodash";
import { AppThunk } from "../subtitleEditReducers";
import { Dispatch } from "react";
import { CueDto, SubtitleEditAction, Track } from "../model";
import { Constants } from "../constants";

const DEBOUNCE_TIMEOUT = 2500;
interface SaveAction extends SubtitleEditAction {
    cues: CueDto[];
    editingTrack: Track | null;
}

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
        call: (state, action: PayloadAction<SaveAction>): void => state ? state(action.payload) : null,
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
        [saveTrackSlice.actions.call.type]: (): string => Constants.AUTO_SAVE_SAVING_CHANGES_MSG,
        [autoSaveSuccessSlice.actions.setAutoSaveSuccess.type]: (_state, action: PayloadAction<boolean>): string =>
            action.payload ? Constants.AUTO_SAVE_SUCCESS_CHANGES_SAVED_MSG : Constants.AUTO_SAVE_ERROR_SAVING_MSG
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
    (dispatch: Dispatch<PayloadAction<boolean | SaveAction>>, getState): void => {
        dispatch(autoSaveSuccessSlice.actions.setAutoSaveSuccess(success));
        const pendingSave = getState().pendingSave;
        if (pendingSave) {
            const cues = getState().cues;
            const editingTrack = getState().editingTrack;
            dispatch(saveTrackSlice.actions.call({ cues, editingTrack }));
            dispatch(pendingSaveSlice.actions.setPendingSave(false));
        }
    };

export const callSaveTrack = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SaveAction | boolean>>, getState): void => {
        const saveStatus = getState().saveStatus;
        if (saveStatus !== Constants.AUTO_SAVE_SAVING_CHANGES_MSG) {
            const cues = getState().cues;
            const editingTrack = getState().editingTrack;
            if (cues && editingTrack) {
                dispatch(saveTrackSlice.actions.call({ cues, editingTrack }));
            }
        } else {
            dispatch(pendingSaveSlice.actions.setPendingSave(true));
        }
    };
