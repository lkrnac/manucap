import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { findIndex, findLastIndex } from "lodash";

import { CueDto, ScrollPosition, SubtitleEditAction } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";
import { editingTrackSlice } from "../../trackSlices";
import { scrollPositionSlice } from "../cuesListScrollSlice";
import sanitizeHtml from "sanitize-html";
import { CueIndexAction, cuesSlice, editingCueIndexSlice } from "../cueSlices";
import { SearchDirection, SearchReplace } from "./model";

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

const setSearchReplaceForCueIndex = (
    dispatch: Dispatch<PayloadAction<CueIndexAction | number | undefined>>,
    cueIndex: number): void => {
    dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx: cueIndex }));
    dispatch(scrollPositionSlice.actions.changeScrollPosition(ScrollPosition.CURRENT));
};

const setSearchReplaceForNextCueIndex = (
    dispatch: Dispatch<PayloadAction<CueIndexAction | number | undefined>>,
    cueIndex: number,
    cues: Array<CueDto>): void => {
    setSearchReplaceForCueIndex(dispatch, cueIndex);
    if (cueIndex === -1) {
        return;
    }
    const cue = cues[cueIndex];
    if (cue.searchReplaceMatches) {
        const searchMatches = { ...cue.searchReplaceMatches, offsetIndex: 0 };
        dispatch(cuesSlice.actions.addSearchMatches({ idx: cueIndex, searchMatches }));
    }
};

const setSearchReplaceForPreviousCueIndex = (
    dispatch: Dispatch<PayloadAction<CueIndexAction | number | undefined>>,
    cueIndex: number,
    cues: Array<CueDto>): void => {
    setSearchReplaceForCueIndex(dispatch, cueIndex);
    if (cueIndex === -1) {
        return;
    }
    const cue = cues[cueIndex];
    if (cue.searchReplaceMatches) {
        const lastIndex = cue.searchReplaceMatches.offsets.length - 1;
        const searchMatches = { ...cue.searchReplaceMatches, offsetIndex: lastIndex };
        dispatch(cuesSlice.actions.addSearchMatches({ idx: cueIndex, searchMatches }));
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
    (dispatch: Dispatch<PayloadAction<CueIndexAction | SearchDirection | number | undefined>>, getState): void => {
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
                    )
                );
                return;
            } else {
                fromIndex += 1;
            }
        }
        const matchCase = getState().searchReplace.matchCase;
        const matchedIndex = findIndex(cues,
                cue => searchCueText(cue.vttCue.text, find, matchCase).length > 0, fromIndex);
        if (matchedIndex !== -1) {
            setSearchReplaceForNextCueIndex(dispatch, matchedIndex, getState().cues);
        } else if (fromIndex > 0) {
            let wrappedIndex = findIndex(cues,
                    cue => searchCueText(cue.vttCue.text, find, matchCase).length > 0);
            wrappedIndex = wrappedIndex === (fromIndex - 1) ? -1 : wrappedIndex;
            setSearchReplaceForNextCueIndex(dispatch, wrappedIndex, getState().cues);
        }
    };

export const searchPreviousCues = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueIndexAction | SearchDirection | number | undefined>>, getState): void => {
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
                    )
                );
                return;
            } else {
                fromIndex -= 1;
            }
        }
        const matchCase = getState().searchReplace.matchCase;
        const matchedIndex = findLastIndex(cues,
                cue => searchCueText(cue.vttCue.text, find, matchCase).length > 0, fromIndex);
        if (matchedIndex !== -1) {
            setSearchReplaceForPreviousCueIndex(dispatch, matchedIndex, getState().cues);
        } else if (fromIndex >= 0) {
            let wrappedIndex = findLastIndex(cues,
                    cue => searchCueText(cue.vttCue.text, find, matchCase).length > 0);
            wrappedIndex = wrappedIndex === (fromIndex + 1) ? -1 : wrappedIndex;
            setSearchReplaceForPreviousCueIndex(dispatch, wrappedIndex, getState().cues);
        }
    };

export const replaceCurrentMatch = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<void>>): void => {
        dispatch(searchReplaceSlice.actions.replaceMatchSignal());
    };
