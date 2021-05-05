import { Action, combineReducers } from "@reduxjs/toolkit";
import { cuesSlice } from "./cues/cuesListSlices";
import { editingTrackSlice, taskSlice } from "./trackSlices";
import { ThunkAction } from "redux-thunk";
import { playVideoSectionSlice } from "./player/playbackSlices";
import { editorStatesSlice } from "./cues/edit/editorStatesSlice";
import { subtitleSpecificationSlice } from "./toolbox/subtitleSpecificationSlice";
import { loadingIndicatorSlices } from "./loadingIndicatorSlices";
import { saveStateSlice, saveTrackSlice } from "./cues/saveSlices";
import { scrollPositionSlice } from "./cues/cuesListScrollSlice";
import { cuesLoadingCounterSlice } from "./cues/cuesLoadingCounterSlice";
import { searchReplaceSlice, searchReplaceVisibleSlice } from "./cues/searchReplace/searchReplaceSlices";
import { spellcheckerSettingsSlice } from "./spellcheckerSettingsSlice";
import { sourceCuesSlice } from "./cues/view/sourceCueSlices";
import {
    editingCueIndexSlice,
    glossaryTermSlice,
    lastCueChangeSlice,
    validationErrorSlice
} from "./cues/edit/cueEditorSlices";

export const Reducers = {
    cues: cuesSlice.reducer,
    editingTrack: editingTrackSlice.reducer,
    cuesTask: taskSlice.reducer,
    subtitleSpecifications: subtitleSpecificationSlice.reducer,
    editorStates: editorStatesSlice.reducer,
    sourceCues: sourceCuesSlice.reducer,
    videoSectionToPlay: playVideoSectionSlice.reducer,
    loadingIndicator: loadingIndicatorSlices.reducer,
    saveTrack: saveTrackSlice.reducer,
    saveState: saveStateSlice.reducer,
    scrollPosition: scrollPositionSlice.reducer,
    cuesLoadingCounter: cuesLoadingCounterSlice.reducer,
    spellCheckerSettings: spellcheckerSettingsSlice.reducer,
    searchReplace: searchReplaceSlice.reducer,
    searchReplaceVisible: searchReplaceVisibleSlice.reducer,

    editingCueIndex: editingCueIndexSlice.reducer,
    lastCueChange: lastCueChangeSlice.reducer,
    validationErrors: validationErrorSlice.reducer,
    glossaryTerm: glossaryTermSlice.reducer,
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
