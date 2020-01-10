import { combineReducers, Action } from "@reduxjs/toolkit";
import {editingTrackSlice, cuesSlice, taskSlice} from "../player/trackSlices";
import {subtitleSpecificationSlice} from "../toolbox/subtitleSpecificationSlice";
import {ThunkAction} from "redux-thunk";
import {editorStatesSlice} from "../subtitleEdit/editorStatesSlice";

const subtitleEditReducers = combineReducers({
    cues: cuesSlice.reducer,
    editingTrack: editingTrackSlice.reducer,
    task: taskSlice.reducer,
    subtitleSpecficiations: subtitleSpecificationSlice.reducer,
    editorStates: editorStatesSlice.reducer
});
export default subtitleEditReducers;

export type SubtitleEditState = ReturnType<typeof subtitleEditReducers>;
export type AppThunk = ThunkAction<void, SubtitleEditState, null, Action<string>>;
