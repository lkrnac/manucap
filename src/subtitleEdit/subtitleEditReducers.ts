import { Action, combineReducers } from "@reduxjs/toolkit";
import { cuesSlice, editingCueIndexSlice, pendingCueChangesSlice, sourceCuesSlice } from "./cues/cueSlices";
import { editingTrackSlice, taskSlice } from "./trackSlices";
import { ThunkAction } from "redux-thunk";
import { changePlayerTimeSlice } from "./player/playbackSlices";
import { editorStatesSlice } from "./cues/edit/editorStatesSlice";
import { subtitleSpecificationSlice } from "./toolbox/subtitleSpecificationSlice";

export const Reducers = {
    cues: cuesSlice.reducer,
    editingCueIndex: editingCueIndexSlice.reducer,
    editingTrack: editingTrackSlice.reducer,
    cuesTask: taskSlice.reducer,
    subtitleSpecifications: subtitleSpecificationSlice.reducer,
    editorStates: editorStatesSlice.reducer,
    sourceCues: sourceCuesSlice.reducer,
    changePlayerTime: changePlayerTimeSlice.reducer,
    pendingCueChanges: pendingCueChangesSlice.reducer
};

const subtitleEditReducers = combineReducers(Reducers);

export default subtitleEditReducers;

export type SubtitleEditState = ReturnType<typeof subtitleEditReducers>;

/**
 * We are forced to use `as {} as AnyAction` casting then we are executing actions with `testingStore.dispatch`.
 * This seem to be related problem: https://github.com/reduxjs/redux-toolkit/issues/321.
 * But no suggestions from that issue work nor mentioned fix didn't work. I couldn't figure out any other fix than
 * applying ugly cast workaround.
 */
export type AppThunk = ThunkAction<void, SubtitleEditState, unknown, Action<string>>;
