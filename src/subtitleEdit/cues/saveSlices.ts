import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { debounce } from "lodash";
import { AppThunk } from "../subtitleEditReducers";
import { Dispatch } from "react";
import { CueDto, SubtitleEditAction, Track } from "../model";
import { editingTrackSlice } from "../trackSlices";

const DEBOUNCE_TIMEOUT = 2500;
interface SaveAction extends SubtitleEditAction {
    cues: CueDto[];
    editingTrack: Track | null;
}

export enum SaveState {
    NONE,
    TRIGGERED,
    REQUEST_SENT,
    RETRY,
    SAVED,
    ERROR,
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
        call: (state, action: PayloadAction<SaveAction>): void => state ? state(action.payload) : null,
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): null => null
    }
});

export const saveStateSlice = createSlice({
    name: "saveState",
    initialState: SaveState.NONE,
    reducers: {
        setState: (_state, action: PayloadAction<SaveState>): SaveState => action.payload,
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): SaveState => SaveState.NONE
    }
});

export const setSaveTrack = (saveTrack: Function): AppThunk =>
    (dispatch: Dispatch<PayloadAction<Function>>): void => {
        dispatch(saveTrackSlice.actions.set(saveTrack));
    };

const saveTrackCurrent = (dispatch: Dispatch<PayloadAction<SaveAction | SaveState>>, getState: Function): void => {
    const cues = getState().cues;
    const editingTrack = getState().editingTrack;
    if (cues && editingTrack) {
        if (getState().saveState === SaveState.TRIGGERED) {
            dispatch(saveTrackSlice.actions.call({ cues, editingTrack }));
            dispatch(saveStateSlice.actions.setState(SaveState.REQUEST_SENT));
        }
    }
};

const saveTrackDebounced = debounce(saveTrackCurrent, DEBOUNCE_TIMEOUT, { leading: false, trailing: true });

export const callSaveTrack =
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState: Function): void => {
        const saveState = getState().saveState;
        console.log(getState().cues[0].vttCue);
        if (saveState === SaveState.REQUEST_SENT || saveState === SaveState.RETRY) {
            dispatch(saveStateSlice.actions.setState(SaveState.RETRY));
        } else {
            dispatch(saveStateSlice.actions.setState(SaveState.TRIGGERED));
            saveTrackDebounced(dispatch, getState);
        }
    };

export const setAutoSaveSuccess = (success: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean | SaveAction | SaveState>>, getState): void => {
        if (getState().saveState === SaveState.RETRY) {
            const cues = getState().cues;
            const editingTrack = getState().editingTrack;
            if (cues && editingTrack) {
                dispatch(saveTrackSlice.actions.call({ cues, editingTrack }));
                dispatch(saveStateSlice.actions.setState(SaveState.REQUEST_SENT));
            }
        } else {
            dispatch(saveStateSlice.actions.setState(success ? SaveState.SAVED : SaveState.ERROR));
        }
    };
