import { CueCategory, CueDto, Task, Track } from "./model";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
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

interface CueIndexAction extends SubtitleEditAction {
    idx: number;
}

export interface CueAction extends CueIndexAction {
    vttCue: VTTCue;
}

interface CuesAction extends SubtitleEditAction {
    cues: CueDto[];
}

export const cuesSlice = createSlice({
    name: "cues",
    initialState: [] as CueDto[],
    reducers: {
        updateVttCue: (state, action: PayloadAction<CueAction>): void => {
            const cueCategory = state[action.payload.idx]
                ? state[action.payload.idx].cueCategory
                : "DIALOGUE";
            state[action.payload.idx] = { vttCue: action.payload.vttCue, cueCategory };
        },
        addCue: (state, action: PayloadAction<CueAction>): void => {
            const newCueDto = { vttCue: action.payload.vttCue, cueCategory: "DIALOGUE" as CueCategory };
            state.splice(action.payload.idx, 0, newCueDto);
        },
        deleteCue: (state, action: PayloadAction<CueIndexAction>): void => {
            state.splice(action.payload.idx, 1);
        },
        updateCues: (_state, action: PayloadAction<CuesAction>): CueDto[] => action.payload.cues
    }
});

export const editingTrackSlice = createSlice({
    name: "editingTrack",
    initialState: null as Track | null,
    reducers: {
        updateEditingTrack: (_state, action: PayloadAction<EditingTrackAction>): Track => action.payload.editingTrack
    },
    extraReducers: {
        [cuesSlice.actions.updateVttCue.type]: (state, action: PayloadAction<CueAction>): void => {
            if (state && state.currentVersion) {
                state.currentVersion.cues[action.payload.idx].vttCue = action.payload.vttCue;
            }
        },
        [cuesSlice.actions.addCue.type]: (state, action: PayloadAction<CueAction>): void => {
            if (state && state.currentVersion) {
                const newCueDto = { vttCue: action.payload.vttCue, cueCategory: "DIALOGUE" as CueCategory };
                state.currentVersion.cues.splice(action.payload.idx, 0, newCueDto);
            }
        },
        [cuesSlice.actions.deleteCue.type]: (state, action: PayloadAction<CueIndexAction>): void => {
            if (state && state.currentVersion) {
                state.currentVersion.cues.splice(action.payload.idx, 1);
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

export const updateVttCue = (idx: number, vttCue: VTTCue): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueAction>>): void => {
        dispatch(cuesSlice.actions.updateVttCue({ idx, vttCue }));
    };

export const addCue = (idx: number, vttCue: VTTCue): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueAction>>): void => {
        dispatch(cuesSlice.actions.addCue({ idx, vttCue }));
    };

export const deleteCue = (idx: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueIndexAction>>): void => {
        dispatch(cuesSlice.actions.deleteCue({ idx }));
    };

export const updateEditingTrack = (track: Track): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(editingTrackSlice.actions.updateEditingTrack({ editingTrack: track }));
        const cues = track && track.currentVersion ? track.currentVersion.cues : [] as CueDto[];
        dispatch(cuesSlice.actions.updateCues({ cues }));
    };

export const updateTask = (task: Task): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(taskSlice.actions.updateTask({ task }));
    };

