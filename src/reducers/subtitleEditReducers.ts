import { combineReducers, Action } from "@reduxjs/toolkit";
import {editingTrackSlice, cuesSlice, taskSlice} from "../player/trackSlices";
import {ThunkAction} from "redux-thunk";
import {editorStatesSlice} from "../subtitleEdit/editorStatesSlice";

const subtitleEditReducers = combineReducers({
    cues: cuesSlice.reducer,
    editingTrack: editingTrackSlice.reducer,
    task: taskSlice.reducer,
    editorStates: editorStatesSlice.reducer
});
export default subtitleEditReducers;

export type SubtitleEditState = ReturnType<typeof subtitleEditReducers>;
export type AppThunk = ThunkAction<void, SubtitleEditState, null, Action<string>>;
