import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { findIndex, findLastIndex } from "lodash";
import sanitizeHtml from "sanitize-html";

import { CueDto, SubtitleEditAction } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";
import { editingTrackSlice } from "../../trackSlices";
import { cuesSlice } from "../cuesListSlices";
import { SearchDirection, SearchReplace } from "./model";
import { updateEditingCueIndexNoThunk } from "../edit/cueEditorSlices";

export const searchCueText = (text: string, find: string, matchCase: boolean): Array<number> => {
    if (find === "") {
        return [];
    }
    const plainText = sanitizeHtml(text, { allowedTags: []});
    if (plainText === "") {
        return [];
    }
    const regExpFlag = matchCase ? "g" : "gi";
    const re = new RegExp(find, regExpFlag);
    const results = [];
    while (re.exec(plainText)){
        results.push(re.lastIndex - find.length);
    }
    return results;
};

const finNextOffsetIndexForSearch = (
    cue: CueDto,
    offsets: Array<number>,
    direction: SearchDirection
): number => {
    const lastIndex = offsets.length - 1;
    if (cue.searchReplaceMatches && cue.searchReplaceMatches.offsetIndex >= 0) {
        return cue.searchReplaceMatches.offsetIndex < lastIndex ?
            cue.searchReplaceMatches.offsetIndex : lastIndex;
    }
    return direction === "NEXT" ? 0 : lastIndex;
};

export const updateSearchMatches = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>,
    getState: Function,
    idx: number
): void => {
    const searchReplace = getState().searchReplace;
    const cue = getState().cues[0];
    if (cue) {
        const offsets = searchCueText(cue.vttCue.text, searchReplace.find, searchReplace.matchCase);
        const offsetIndex = finNextOffsetIndexForSearch(cue, offsets, searchReplace.direction);
        dispatch(cuesSlice.actions.addSearchMatches(
            {
                idx,
                searchMatches: { offsets, matchLength: searchReplace.find.length, offsetIndex }
            }
        ));
    }
};

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
    replaceMatchCounter: 0,
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
        replaceMatchSignal: (_state): void => {
            _state.replaceMatchCounter += 1;
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

export const searchNextCues = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState): void => {
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
                dispatch(cuesSlice.actions.addSearchMatches(
                    { idx: fromIndex, searchMatches: { ...cueMatches, offsetIndex: cueMatches.offsetIndex + 1 }}
                ));
                return;
            } else {
                fromIndex += 1;
            }
        }
        const matchCase = getState().searchReplace.matchCase;
        const matchedIndex = findIndex(
            cues,
            cue => searchCueText(cue.vttCue.text, find, matchCase).length > 0,
            fromIndex
        );
        if (matchedIndex !== -1) {
            updateEditingCueIndexNoThunk(dispatch, getState, matchedIndex);
        } else if (fromIndex > 0) {
            let wrappedIndex = findIndex(cues,
                    cue => searchCueText(cue.vttCue.text, find, matchCase).length > 0);
            wrappedIndex = wrappedIndex === (fromIndex - 1) ? -1 : wrappedIndex;
            updateEditingCueIndexNoThunk(dispatch, getState, wrappedIndex);
        }
    };

export const searchPreviousCues = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState): void => {
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
        const matchedIndex = findLastIndex(cues,
                cue => searchCueText(cue.vttCue.text, find, matchCase).length > 0, fromIndex);
        if (matchedIndex !== -1) {
            updateEditingCueIndexNoThunk(dispatch, getState, matchedIndex);
        } else if (fromIndex >= 0) {
            let wrappedIndex = findLastIndex(cues,
                    cue => searchCueText(cue.vttCue.text, find, matchCase).length > 0);
            wrappedIndex = wrappedIndex === (fromIndex + 1) ? -1 : wrappedIndex;
            updateEditingCueIndexNoThunk(dispatch, getState, wrappedIndex);
        }
    };

export const replaceCurrentMatch = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<void>>): void => {
        dispatch(searchReplaceSlice.actions.replaceMatchSignal());
    };
