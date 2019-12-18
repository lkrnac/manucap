import { combineReducers, Action } from "@reduxjs/toolkit";
import {editingTrackSlice, cuesSlice} from "../player/trackSlices";
import {ThunkAction} from "redux-thunk";


const subtitleEditReducers = combineReducers({
    cues: cuesSlice.reducer,
    editingTrack: editingTrackSlice.reducer
});

export type SubtitleEditState = ReturnType<typeof subtitleEditReducers>;

export default subtitleEditReducers;

type RootState = ReturnType<typeof subtitleEditReducers>;
export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;
