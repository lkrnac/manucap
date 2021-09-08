import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SubtitleEditAction, Task, Track } from "./model";
import { AppThunk } from "./subtitleEditReducers";
import { Dispatch } from "react";

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

export const timecodesLockSlice = createSlice({
    name: "timecodesUnlocked",
    initialState: false,
    reducers: {
        unlockTimecodes: (_state, action: PayloadAction<boolean>): boolean => action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): boolean => false
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
