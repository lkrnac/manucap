import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Task, Track } from "./model";
import { AppThunk } from "../reducers/subtitleEditReducers";
import { Dispatch } from "react";

/**
 * This is marker interface for all the actions that can be dispatched
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SubtitleEditAction {
}

interface EditingTrackAction extends SubtitleEditAction {
    editingTrack: Track;
}

interface TaskAction extends SubtitleEditAction {
    task: Task;
}

export interface CueAction extends SubtitleEditAction {
    idx: number;
    cue: VTTCue;
}

interface CuesAction extends SubtitleEditAction {
    cues: VTTCue[];
}

export const cuesSlice = createSlice({
    name: "cues",
    initialState: [] as VTTCue[],
    reducers: {
        updateCue: (state, action: PayloadAction<CueAction>): void => {
            state[action.payload.idx] = action.payload.cue;
        },
        addCue: (state, action: PayloadAction<CueAction>): void => {
            state.splice(action.payload.idx, 0, action.payload.cue);
        },
        updateCues: (_state, action: PayloadAction<CuesAction>): VTTCue[] => action.payload.cues
    }
});

export const editingTrackSlice = createSlice({
    name: "editingTrack",
    initialState: null as Track | null,
    reducers: {
        updateEditingTrack: (_state, action: PayloadAction<EditingTrackAction>): Track => action.payload.editingTrack,
        updateEditingTrackCues: (state, action: PayloadAction<CueAction>): void => {
            if (state) {
                const cues = state.currentVersion ? state.currentVersion.cues : [];
                cues[action.payload.idx] = action.payload.cue;
                state.currentVersion = { cues };
            }
        }
    }
});

export const taskSlice = createSlice({
    name: "task",
    initialState: null as Task | null,
    reducers: {
        updateTask: (_state, action: PayloadAction<TaskAction>): Task => action.payload.task,
    }
});

export const updateCue = (idx: number, cue: VTTCue): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueAction>>): void => {
        dispatch(cuesSlice.actions.updateCue({ idx, cue }));
        dispatch(editingTrackSlice.actions.updateEditingTrackCues({ idx, cue }));
    };

export const addCue = (idx: number, cue: VTTCue): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueAction>>): void => {
        dispatch(cuesSlice.actions.addCue({ idx, cue }));
    };

export const updateEditingTrack = (track: Track): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(editingTrackSlice.actions.updateEditingTrack({ editingTrack: track }));
        const cues = track && track.currentVersion ? track.currentVersion.cues : [] as VTTCue[];
        dispatch(cuesSlice.actions.updateCues({ cues }));
    };

export const updateTask = (task: Task): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(taskSlice.actions.updateTask({ task }));
    };

