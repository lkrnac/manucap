import { Action, combineReducers } from "@reduxjs/toolkit";
import { cuesSlice, editingCueIndexSlice, sourceCuesSlice } from "./cues/cueSlices";
import { editingTrackSlice, taskSlice } from "./trackSlices";
import { ThunkAction } from "redux-thunk";
import { editorStatesSlice } from "./cues/edit/editorStatesSlice";
import { subtitleSpecificationSlice } from "./toolbox/subtitleSpecificationSlice";

export const Reducers = {
    cues: cuesSlice.reducer,
    editingCueIndex: editingCueIndexSlice.reducer,
    editingTrack: editingTrackSlice.reducer,
    cuesTask: taskSlice.reducer,
    subtitleSpecifications: subtitleSpecificationSlice.reducer,
    editorStates: editorStatesSlice.reducer,
    sourceCues: sourceCuesSlice.reducer
};

const subtitleEditReducers = combineReducers(Reducers);

export default subtitleEditReducers;

export type SubtitleEditState = ReturnType<typeof subtitleEditReducers>;
export type AppThunk = ThunkAction<void, SubtitleEditState, null, Action<string>>;
