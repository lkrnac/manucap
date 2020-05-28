import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { debounce } from "lodash";
import { AppThunk } from "../subtitleEditReducers";
import { Dispatch } from "react";
import { CueDto, SaveStatus, SubtitleEditAction, Track } from "../model";

const DEBOUNCE_TIMEOUT = 2500;
export const SAVING_CHANGES_MSG = "Saving changes";
export const CHANGES_SAVED_MSG = "All changes saved to server";
export const ERROR_SAVING_MSG = "Error saving latest changes";

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
    initialState: { message: "", pendingChanges: false } as SaveStatus,
    reducers: {},
    extraReducers: {
        [saveTrackSlice.actions.call.type]: (state): SaveStatus => {
            state.pendingChanges = true;
            state.message = SAVING_CHANGES_MSG;
            return state;
        },
        [autoSaveSuccessSlice.actions.setAutoSaveSuccess.type]:
            (state, action: PayloadAction<boolean>): SaveStatus => {
                state.pendingChanges = false;
                state.message = action.payload ? CHANGES_SAVED_MSG : ERROR_SAVING_MSG;
                return state;
            }

    }
});

export const setSaveTrack = (saveTrack: Function): AppThunk =>
    (dispatch: Dispatch<PayloadAction<Function>>): void => {
        dispatch(saveTrackSlice.actions.set(saveTrack));
    };

export const setAutoSaveSuccess = (success: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean | SaveAction>>): void => {
        dispatch(autoSaveSuccessSlice.actions.setAutoSaveSuccess(success));
    };

export const callSaveTrack = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SaveAction | boolean>>, getState): void => {
        const pendingChange = getState().saveStatus.pendingChanges;
        if (!pendingChange) {
            const cues = getState().cues;
            const editingTrack = getState().editingTrack;
            if (cues && editingTrack) {
                dispatch(saveTrackSlice.actions.call({ cues, editingTrack }));
            }
        }
    };
