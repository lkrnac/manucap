import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { findIndex, findLastIndex } from "lodash";

import { CueDto, ScrollPosition, SearchReplace, SubtitleEditAction } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";
import { editingTrackSlice } from "../../trackSlices";
import { scrollPositionSlice } from "../cuesListScrollSlice";
import sanitizeHtml from "sanitize-html";
import { CueIndexAction, cuesSlice, editingCueIndexSlice } from "../cueSlices";

export const searchCueText = (text: string, find: string): Array<number> => {
    const plainText = sanitizeHtml(text, { allowedTags: []});
    if (plainText === "") {
        return [];
    }
    const re = new RegExp(find,"g");
    const results = [];
    while (re.exec(plainText)){
        results.push(re.lastIndex - find.length);
    }
    return results;
};

export const getOffsetIndex = (
    cue: CueDto,
    offsets: Array<number>
): number => {
    if (cue.searchReplaceMatches) {
        return cue.searchReplaceMatches.offsetIndex < offsets.length - 1 ?
            cue.searchReplaceMatches.offsetIndex : offsets.length - 1;
    }
    return 0;
};

const setSearchReplaceForCueIndex = (
    dispatch: Dispatch<PayloadAction<CueIndexAction | number | undefined>>,
    cueIndex: number): void => {
    dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx: cueIndex }));
    dispatch(scrollPositionSlice.actions.changeScrollPosition(ScrollPosition.CURRENT));
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

const initialSearchReplace = { find: "", replaceMatchCounter: 0 } as SearchReplace;

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
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(searchReplaceSlice.actions.setFind(find));
    };

export const setReplacement = (replacement: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(searchReplaceSlice.actions.setReplacement(replacement));
    };

export const showSearchReplace = (visible: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean>>): void => {
        dispatch(searchReplaceVisibleSlice.actions.setSearchReplaceVisible(visible));
    };

export const searchNextCues = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueIndexAction | number | undefined>>, getState): void => {
        const find = getState().searchReplace.find;
        if (find === "") {
            return;
        }
        let fromIndex = getState().editingCueIndex >= 0 ? getState().editingCueIndex : 0;
        const cues = getState().cues;
        const currentCue = cues[fromIndex];
        const cueMatches = currentCue.searchReplaceMatches;
        if (cueMatches) {
            if (cueMatches.offsetIndex < cueMatches.offsets.length - 1) {
                dispatch(cuesSlice.actions.addSearchMatches(
                    { idx: fromIndex, searchMatches: { ...cueMatches, offsetIndex: cueMatches.offsetIndex + 1 } }
                    )
                );
                return;
            } else {
                fromIndex += 1;
            }
        }
        const matchedIndex = findIndex(cues, cue => searchCueText(cue.vttCue.text, find).length > 0, fromIndex);
        if (matchedIndex !== -1) {
            setSearchReplaceForCueIndex(dispatch, matchedIndex);
        }
    };

export const searchPreviousCues = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueIndexAction | number | undefined>>, getState): void => {
        const find = getState().searchReplace.find;
        if (find === "") {
            return;
        }
        let fromIndex = getState().editingCueIndex >= 0 ? getState().editingCueIndex : 0;
        const cues = getState().cues;
        const currentCue = cues[fromIndex];
        const cueMatches = currentCue.searchReplaceMatches;
        if (cueMatches) {
            if (cueMatches.offsetIndex > 0) {
                dispatch(cuesSlice.actions.addSearchMatches(
                    { idx: fromIndex, searchMatches: { ...cueMatches, offsetIndex: cueMatches.offsetIndex - 1 } }
                    )
                );
                return;
            } else {
                fromIndex -= 1;
            }
        }
        const matchedIndex = findLastIndex(cues, cue => searchCueText(cue.vttCue.text, find).length > 0, fromIndex);
        if (matchedIndex !== -1) {
            setSearchReplaceForCueIndex(dispatch, matchedIndex);
        }
    };

export const replaceCurrentMatch = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<void>>): void => {
        dispatch(searchReplaceSlice.actions.replaceMatchSignal());
    };
