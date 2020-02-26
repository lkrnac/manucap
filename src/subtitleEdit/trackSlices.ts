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
        updateEditingTrack: (_state, action: PayloadAction<EditingTrackAction>): Track => action.payload.editingTrack
    }
});

export const taskSlice = createSlice({
    name: "task",
    initialState: null as Task | null,
    reducers: {
        updateTask: (_state, action: PayloadAction<TaskAction>): Task => action.payload.task,
    }
});

export const updateEditingTrack = (track: Track): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(editingTrackSlice.actions.updateEditingTrack({ editingTrack: track }));
    };

export const updateTask = (task: Task): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(taskSlice.actions.updateTask({ task }));
    };
