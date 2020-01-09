import { combineReducers, Action } from "@reduxjs/toolkit";
import {editingTrackSlice, cuesSlice, taskSlice} from "../player/trackSlices";
import {subtitleSpecificationSlice} from "../toolbox/subtitleSpecificationSlice";
import {ThunkAction} from "redux-thunk";


const subtitleEditReducers = combineReducers({
    cues: cuesSlice.reducer,
    editingTrack: editingTrackSlice.reducer,
    task: taskSlice.reducer,
    subtitleSpecficiations: subtitleSpecificationSlice.reducer
});

export type SubtitleEditState = ReturnType<typeof subtitleEditReducers>;

export default subtitleEditReducers;

type RootState = ReturnType<typeof subtitleEditReducers>;
export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;
