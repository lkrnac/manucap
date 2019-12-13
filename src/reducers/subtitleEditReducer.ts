import { combineReducers, Action } from "@reduxjs/toolkit";
import testReducer from "./testReducer";
import {editingTrackSlice, cuesSlice} from "../player/trackSlices";
import {ThunkAction} from "redux-thunk";


const subtitleEditReducers = combineReducers({
    testReducer,
    cues: cuesSlice.reducer,
    editingTrack: editingTrackSlice.reducer
});

export type SubtitleEditState = ReturnType<typeof subtitleEditReducers>;

export default subtitleEditReducers;

export type RootState = ReturnType<typeof subtitleEditReducers>;
export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;


/**
 * This is marker interface for all the actions that can be dispatched
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SubtitleEditAction {
}
