import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SubtitleEditAction, Task, Track } from "./model";
import { AppThunk } from "./subtitleEditReducers";
import { Dispatch } from "react";
import { debounce } from "lodash";

interface EditingTrackAction extends SubtitleEditAction {
    editingTrack: Track;
}

interface TaskAction extends SubtitleEditAction {
    task: Task;
}

export const editingTrackSlice = createSlice({
    name: "editingTrack",
    initialState: null as Track | null,
    reducers: {
        updateEditingTrack: (_state, action: PayloadAction<EditingTrackAction>): Track => action.payload.editingTrack,
        resetEditingTrack: (): Track | null => null
    }
});

export const taskSlice = createSlice({
    name: "cuesTask",
    initialState: null as Task | null,
    reducers: {
        updateTask: (_state, action: PayloadAction<TaskAction>): Task => action.payload.task,
    }
});

const DEBOUNCE_TIMEOUT = 500;

export const saveTrackSlice = createSlice({
    name: "saveTrack",
    initialState: null as Function | null,
    reducers: {
        // @ts-ignore debounce expects any type
        set: (_state, action: PayloadAction<Function>): Function => debounce(action.payload, DEBOUNCE_TIMEOUT),
        call: (state): void => state ? state() : null,
    }
});

export const updateEditingTrack = (track: Track): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(editingTrackSlice.actions.updateEditingTrack({ editingTrack: track }));
    };

export const resetEditingTrack = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<void>>): void => {
        dispatch(editingTrackSlice.actions.resetEditingTrack());
    };

export const updateTask = (task: Task): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(taskSlice.actions.updateTask({ task }));
    };

export const setSaveTrack = (saveTrack: Function): AppThunk =>
    (dispatch: Dispatch<PayloadAction<Function>>): void => {
        dispatch(saveTrackSlice.actions.set(saveTrack));
    };

export const callSaveTrack = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<void>>): void => {
        dispatch(saveTrackSlice.actions.call());
    };
