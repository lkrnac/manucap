import { Action, combineReducers } from "@reduxjs/toolkit";
import { cuesSlice, editingTrackSlice, taskSlice } from "../player/trackSlices";
import { ThunkAction } from "redux-thunk";
import { editorStatesSlice } from "../subtitleEdit/editorStatesSlice";
import { subtitleSpecificationSlice } from "../toolbox/subtitleSpecificationSlice";

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
