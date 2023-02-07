import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { debounce } from "lodash";
import { AppThunk } from "../subtitleEditReducers";
import { Dispatch } from "react";
import { CueDto, SubtitleEditAction, Track } from "../model";
import { editingTrackSlice } from "../trackSlices";
import { retrySaveCueUpdateIfNeeded } from "./saveCueUpdateSlices";
import { retrySaveCueDeleteIfNeeded } from "./saveCueDeleteSlices";

const DEBOUNCE_TIMEOUT = 2500;
interface SaveActionWithPayload extends SubtitleEditAction {
    cues: CueDto[];
    editingTrack: Track | null;
    shouldCreateNewVersion: boolean;
}

export enum SaveState {
    NONE,
    TRIGGERED,
    REQUEST_SENT,
    RETRY,
    SAVED,
    ERROR,
}

export interface SaveAction {
    saveState: SaveState;
    multiCuesEdit: boolean;
}

export const isPendingSaveState = (saveState: SaveState): boolean =>
    saveState === SaveState.TRIGGERED
    || saveState === SaveState.REQUEST_SENT
    || saveState === SaveState.RETRY;

export const saveTrackSlice = createSlice({
    name: "callSaveTrack",
    initialState: null as Function | null,
    reducers: {
        set: (_state, action: PayloadAction<Function>): Function => action.payload,
        call: (state, action: PayloadAction<SaveActionWithPayload>): Function | null => {
            if (state) {
                state(action.payload);
            }
            return state;
        }
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): null => null
    }
});

export const saveActionSlice = createSlice({
    name: "saveAction",
    initialState: { saveState: SaveState.NONE, multiCuesEdit: false },
    reducers: {
        setState: (_state, action: PayloadAction<SaveAction>): SaveAction => action.payload,
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): SaveAction =>
            ({ saveState: SaveState.NONE, multiCuesEdit: false })
    }
});

export const setSaveTrack = (saveTrack: Function): AppThunk =>
    (dispatch: Dispatch<PayloadAction<Function>>): void => {
        dispatch(saveTrackSlice.actions.set(saveTrack));
    };

const sendSaveTrackRequest = (
    getState: Function,
    dispatch: Dispatch<PayloadAction<boolean | SaveActionWithPayload | SaveAction>>
): void => {
    const cues = getState().cues;
    const editingTrack = getState().editingTrack;
    if (cues && editingTrack) {
        dispatch(saveTrackSlice.actions.call(
            { cues, editingTrack, shouldCreateNewVersion: true }
        ));
        dispatch(saveActionSlice.actions.setState(
            { saveState: SaveState.REQUEST_SENT, multiCuesEdit: true }
        ));
    }
};

const saveTrackCurrent = (
    dispatch: Dispatch<PayloadAction<boolean | SaveActionWithPayload | SaveAction>>,
    getState: Function
): void => {
    const saveAction = getState().saveAction;
    if (saveAction.saveState === SaveState.TRIGGERED) {
        sendSaveTrackRequest(getState, dispatch);
    }
};

const saveTrackDebounced = debounce(saveTrackCurrent, DEBOUNCE_TIMEOUT, { leading: false, trailing: true });

export const checkSaveStateAndSave = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    getState: Function,
    saveFunction: Function,
    multiCuesEdit: boolean
): void => {
    const saveAction = getState().saveAction;
    if (saveAction.saveState === SaveState.REQUEST_SENT || saveAction.saveState === SaveState.RETRY) {
        dispatch(saveActionSlice.actions.setState(
            { saveState: SaveState.RETRY, multiCuesEdit: saveAction.multiCuesEdit || multiCuesEdit }
        ));
    } else {
        dispatch(saveActionSlice.actions.setState(
            { saveState: SaveState.TRIGGERED, multiCuesEdit }
        ));
        saveFunction(dispatch, getState);
    }
};

export const callSaveTrack = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    getState: Function
): void => {
    checkSaveStateAndSave(dispatch, getState, saveTrackDebounced, true);
};

type AutoSaveSuccessDispatch = boolean | SaveActionWithPayload | SaveAction | SubtitleEditAction | undefined;

export const setAutoSaveSuccess = (success: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<AutoSaveSuccessDispatch> | AppThunk>, getState): void => {
        const saveAction = getState().saveAction;
        if (saveAction.saveState === SaveState.RETRY) {
            if (saveAction.multiCuesEdit) {
                sendSaveTrackRequest(getState, dispatch);
            } else {
                retrySaveCueUpdateIfNeeded(dispatch, getState);
                retrySaveCueDeleteIfNeeded(dispatch, getState);
            }
        } else {
            const resultState = success ? SaveState.SAVED : SaveState.ERROR;
            dispatch(saveActionSlice.actions.setState({ saveState: resultState, multiCuesEdit: false }));
        }
    };
