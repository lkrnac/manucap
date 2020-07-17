import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { debounce } from "lodash";
import { AppThunk } from "../subtitleEditReducers";
import { Dispatch } from "react";
import { CueDto, SubtitleEditAction, Track } from "../model";
import { Constants } from "../constants";
import { editingTrackSlice } from "../trackSlices";

const DEBOUNCE_TIMEOUT = 2500;
interface SaveAction extends SubtitleEditAction {
    cues: CueDto[];
    editingTrack: Track | null;
}

export const saveTrackSlice = createSlice({
    name: "saveTrack",
    initialState: null as Function | null,
    reducers: {
        set: (_state, action: PayloadAction<Function>): Function => action.payload,
        call: (state, action: PayloadAction<SaveAction>): void => state ? state(action.payload) : null,
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): null => null
    }
});

export const saveStatusSlice = createSlice({
    name: "saveStatus",
    initialState: "",
    reducers: {
        setPendingSave: (): string => Constants.AUTO_SAVE_SAVING_CHANGES_MSG,
        setAutoSaveSuccess: (_state, action: PayloadAction<boolean>): string =>
            action.payload ? Constants.AUTO_SAVE_SUCCESS_CHANGES_SAVED_MSG : Constants.AUTO_SAVE_ERROR_SAVING_MSG,
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): string => ""
    }
});

export const setSaveTrack = (saveTrack: Function): AppThunk =>
    (dispatch: Dispatch<PayloadAction<Function>>): void => {
        dispatch(saveTrackSlice.actions.set(saveTrack));
    };

export const setAutoSaveSuccess = (success: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean | SaveAction>>, getState): void => {
        if (!getState().saveTrack) {
            // To handle case where unmounted before callback from host app
            return;
        }
        dispatch(saveStatusSlice.actions.setAutoSaveSuccess(success));
    };

const saveTrackCurrent = (dispatch: Dispatch<PayloadAction<SaveAction>>, getState: Function): void => {
    const cues = getState().cues;
    const editingTrack = getState().editingTrack;
    if (cues && editingTrack) {
        dispatch(saveTrackSlice.actions.call({ cues, editingTrack }));
    }
};

const saveTrackDebounced = debounce(saveTrackCurrent, DEBOUNCE_TIMEOUT, { leading: false, trailing: true });

export const callSaveTrack = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SaveAction | undefined>>, getState: Function): void => {
        dispatch(saveStatusSlice.actions.setPendingSave());
        saveTrackDebounced(dispatch, getState);
    };
