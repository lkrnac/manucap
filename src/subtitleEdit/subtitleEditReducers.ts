import { Action, combineReducers } from "@reduxjs/toolkit";
import { editingTrackSlice, taskSlice } from "./trackSlices";
import { ThunkAction } from "redux-thunk";
import { cuesSlice } from "./cues/cueSlices";
import { editorStatesSlice } from "./cues/edit/editorStatesSlice";
import { subtitleSpecificationSlice } from "./toolbox/subtitleSpecificationSlice";

const subtitleEditReducers = combineReducers({
    cues: cuesSlice.reducer,
    editingTrack: editingTrackSlice.reducer,
    task: taskSlice.reducer,
    subtitleSpecifications: subtitleSpecificationSlice.reducer,
    editorStates: editorStatesSlice.reducer
});
export default subtitleEditReducers;

export type SubtitleEditState = ReturnType<typeof subtitleEditReducers>;
export type AppThunk = ThunkAction<void, SubtitleEditState, null, Action<string>>;
