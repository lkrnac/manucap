import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";

import { SubtitleEditAction } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";
import { editingTrackSlice } from "../../trackSlices";
import { cuesSlice } from "../cuesList/cuesListSlices";
import { SearchDirection, SearchReplace } from "./model";
import { searchCueText, updateEditingCueIndexNoThunk } from "../edit/cueEditorSlices";

const updateCueMatchesIfNeeded = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    find: string,
    matchCase: boolean,
    getState: Function): void => {
    const cueIndex = getState().editingCueIndex;
    if (cueIndex !== -1) {
        const currentCue = getState().cues[cueIndex];
        const offsets = searchCueText(currentCue.vttCue.text, find, matchCase);
        dispatch(cuesSlice.actions.addSearchMatches(
            { idx: cueIndex, searchMatches: { offsets, matchLength: find.length, offsetIndex: 0 }}
            )
        );
    }
};

export const searchReplaceVisibleSlice = createSlice({
    name: "searchReplaceVisible",
    initialState: false,
    reducers: {
        setSearchReplaceVisible: (_state, action: PayloadAction<boolean>): boolean => action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): boolean => false
    }
});

const initialSearchReplace = {
    find: "",
    replacement: "",
    matchCase: false,
    direction: "NEXT"
} as SearchReplace;

export const searchReplaceSlice = createSlice({
    name: "searchReplace",
    initialState: initialSearchReplace,
    reducers: {
        setFind: (_state, action: PayloadAction<string>): void => {
            _state.find = action.payload;
        },
        setReplacement: (_state, action: PayloadAction<string>): void => {
            _state.replacement = action.payload;
        },
        setMatchCase: (_state, action: PayloadAction<boolean>): void => {
            _state.matchCase = action.payload;
        },
        setDirection: (_state, action: PayloadAction<SearchDirection>): void => {
            _state.direction = action.payload;
        },
        replaceMatchSignal: (state, action: PayloadAction<string>): void => {
            state.replacement = action.payload;
        }
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): SearchReplace => initialSearchReplace,
        [searchReplaceVisibleSlice.actions.setSearchReplaceVisible.type]:
            (_state, action: PayloadAction<boolean>): SearchReplace =>
                action.payload ? _state : initialSearchReplace
    }
});

export const setFind = (find: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        dispatch(searchReplaceSlice.actions.setFind(find));
        const matchCase = getState().searchReplace.matchCase;
        updateCueMatchesIfNeeded(dispatch, find, matchCase, getState);
    };

export const setReplacement = (replacement: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(searchReplaceSlice.actions.setReplacement(replacement));
    };

export const setMatchCase = (matchCase: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        dispatch(searchReplaceSlice.actions.setMatchCase(matchCase));
        const find = getState().searchReplace.find;
        updateCueMatchesIfNeeded(dispatch, find, matchCase, getState);
    };

export const showSearchReplace = (visible: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean | SubtitleEditAction>>, getState): void => {
        dispatch(searchReplaceVisibleSlice.actions.setSearchReplaceVisible(visible));
        const find = getState().searchReplace.find;
        const matchCase = getState().searchReplace.matchCase;
        updateCueMatchesIfNeeded(dispatch, find, matchCase, getState);
    };

export const searchNextCues = (replacement: boolean): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        const find = getState().searchReplace.find;
        if (find === "") {
            return;
        }
        const editingCueIndex = getState().editingCueIndex;
        let fromIndex = editingCueIndex >= 0 ? editingCueIndex : 0;
        const cues = getState().cues;
        if (cues.length === 0) {
            return;
        }
        dispatch(searchReplaceSlice.actions.setDirection("NEXT"));
        const currentCue = cues[fromIndex];
        const cueMatches = currentCue.searchReplaceMatches;
        if (cueMatches && editingCueIndex !== -1) {
            if (cueMatches.offsetIndex < cueMatches.offsets.length - 1) {
                const offsetShift = replacement ? 0 : 1;
                dispatch(cuesSlice.actions.addSearchMatches(
                    {
                        idx: fromIndex,
                        searchMatches: { ...cueMatches, offsetIndex: cueMatches.offsetIndex + offsetShift }
                    }
                ));
                return;
            } else {
                fromIndex += 1;
            }
        }
        const matchCase = getState().searchReplace.matchCase;
        const matchedIndex = _.findIndex(
            cues,
            cue => !cue.editDisabled && searchCueText(cue.vttCue.text, find, matchCase).length > 0,
            fromIndex
        );
        if (matchedIndex !== -1) {
            updateEditingCueIndexNoThunk(dispatch, getState, matchedIndex);
        } else if (fromIndex > 0) {
            let wrappedIndex = _.findIndex(cues, cue =>
                !cue.editDisabled && searchCueText(cue.vttCue.text, find, matchCase).length > 0);
            wrappedIndex = wrappedIndex === (fromIndex - 1) ? -1 : wrappedIndex;
            updateEditingCueIndexNoThunk(dispatch, getState, wrappedIndex);
        }
    };

export const searchPreviousCues = (): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        const find = getState().searchReplace.find;
        if (find === "") {
            return;
        }
        const cues = getState().cues;
        if (cues.length === 0) {
            return;
        }
        dispatch(searchReplaceSlice.actions.setDirection("PREVIOUS"));
        const editingCueIndex = getState().editingCueIndex;
        let fromIndex = editingCueIndex >= 0 ? editingCueIndex : cues.length - 1;
        const currentCue = cues[fromIndex];
        const cueMatches = currentCue.searchReplaceMatches;
        if (cueMatches && editingCueIndex !== -1) {
            if (cueMatches.offsetIndex > 0) {
                dispatch(cuesSlice.actions.addSearchMatches(
                    { idx: fromIndex, searchMatches: { ...cueMatches, offsetIndex: cueMatches.offsetIndex - 1 }}
                ));
                return;
            } else {
                fromIndex -= 1;
            }
        }
        const matchCase = getState().searchReplace.matchCase;
        const matchedIndex = _.findLastIndex(cues,
                cue => !cue.editDisabled && searchCueText(cue.vttCue.text, find, matchCase).length > 0, fromIndex);
        if (matchedIndex !== -1) {
            updateEditingCueIndexNoThunk(dispatch, getState, matchedIndex);
        } else if (fromIndex >= 0) {
            let wrappedIndex = _.findLastIndex(cues,
                    cue => !cue.editDisabled && searchCueText(cue.vttCue.text, find, matchCase).length > 0);
            wrappedIndex = wrappedIndex === (fromIndex + 1) ? -1 : wrappedIndex;
            updateEditingCueIndexNoThunk(dispatch, getState, wrappedIndex);
        }
    };

export const replaceCurrentMatch = (replacement: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<string>>): void => {
        dispatch(searchReplaceSlice.actions.replaceMatchSignal(replacement));
    };
