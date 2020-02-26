import { Action, combineReducers } from "@reduxjs/toolkit";
import { cuesSlice, editingCueIndexSlice } from "./cues/cueSlices";
import { editingTrackSlice, taskSlice } from "./trackSlices";
import { ThunkAction } from "redux-thunk";
import { editorStatesSlice } from "./cues/edit/editorStatesSlice";
import { subtitleSpecificationSlice } from "./toolbox/subtitleSpecificationSlice";

const subtitleEditReducers = combineReducers({
    cues: cuesSlice.reducer,
    editingCueIndex: editingCueIndexSlice.reducer,
    editingTrack: editingTrackSlice.reducer,
    task: taskSlice.reducer,
    subtitleSpecifications: subtitleSpecificationSlice.reducer,
    editorStates: editorStatesSlice.reducer
});
export default subtitleEditReducers;

export type SubtitleEditState = ReturnType<typeof subtitleEditReducers>;
export type AppThunk = ThunkAction<void, SubtitleEditState, null, Action<string>>;
