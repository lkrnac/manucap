import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { findIndex, findLastIndex, replace } from "lodash";

import { CueDto, ScrollPosition, SearchReplace, SubtitleEditAction } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";
import { editingTrackSlice } from "../../trackSlices";
import { scrollPositionSlice } from "../cuesListScrollSlice";
import sanitizeHtml from "sanitize-html";
import { cuesSlice, editingCueIndexSlice } from "../cueSlices";

const matchCueText = (cue: CueDto, find: string): Array<number> => {
    const plainText = sanitizeHtml(cue.vttCue.text, { allowedTags: []});
    if (plainText === "") {
        return [];
    }
    const re = new RegExp(find,'g');
    const results = [];
    while (re.exec(plainText)){
        results.push(re.lastIndex - find.length);
    }
    return results;
}

const setSearchReplaceForCueIndex = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    find: string,
    lastCueTextMatchIndex: number,
    cueIndex: number): void => {
    dispatch(searchReplaceSlice.actions.setSearchReplace({ find, lastCueTextMatchIndex }));
    dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx: cueIndex }));
    dispatch(scrollPositionSlice.actions.changeScrollPosition(ScrollPosition.CURRENT));
}

const setNextMatchInCue = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    find: string,
    lastCueTextMatchIndex: number | undefined,
    cueIndex: number,
    matchedCueTextIndexes: Array<number>
): boolean => {
    const currentIndex = !lastCueTextMatchIndex ? -1 : matchedCueTextIndexes.indexOf(lastCueTextMatchIndex);
    if (currentIndex < matchedCueTextIndexes.length - 1) {
        setSearchReplaceForCueIndex(dispatch, find, matchedCueTextIndexes[currentIndex + 1], cueIndex);
        return true;
    }
    return false;
}

const setPrevMatchInCue = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    find: string,
    lastCueTextMatchIndex: number | undefined,
    cueIndex: number,
    matchedCueTextIndexes: Array<number>
): boolean => {
    const currentIndex = !lastCueTextMatchIndex ? matchedCueTextIndexes.length - 1
        : matchedCueTextIndexes.indexOf(lastCueTextMatchIndex);
    if (currentIndex > 0) {
        setSearchReplaceForCueIndex(dispatch, find, matchedCueTextIndexes[currentIndex - 1], cueIndex);
        return true;
    }
    return false;
}

export const searchReplaceSlice = createSlice({
    name: "searchReplace",
    initialState: null as SearchReplace | null,
    reducers: {
        setSearchReplace: (_state, action: PayloadAction<SearchReplace>): SearchReplace => action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): SearchReplace | null => null
    }
});

export const setSearchReplace = (find: string, lastCueTextMatchIndex: number | undefined): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(searchReplaceSlice.actions.setSearchReplace({ find, lastCueTextMatchIndex }));
    };

export const searchNextCues = (find: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        if (find === "") {
            return;
        }
        let fromIndex = getState().editingCueIndex >= 0 ? getState().editingCueIndex : 0;
        const cues = getState().cues;
        const matchedCueTextIndexes = matchCueText(cues[fromIndex], find);
        const lastCueTextMatchIndex = getState().searchReplace?.lastCueTextMatchIndex;
        if (matchedCueTextIndexes.length > 0
            && setNextMatchInCue(dispatch, find, lastCueTextMatchIndex, fromIndex, matchedCueTextIndexes)) {
                return;
        }
        dispatch(searchReplaceSlice.actions.setSearchReplace({ find, lastCueTextMatchIndex: undefined }));
        fromIndex += 1;
        const matchedIndex = findIndex(cues, cue => matchCueText(cue, find).length > 0, fromIndex);
        if (matchedIndex !== -1) {
            const matchedCueTextIndexes = matchCueText(cues[matchedIndex], find);
            setSearchReplaceForCueIndex(dispatch, find, matchedCueTextIndexes[0], matchedIndex);
        }
    };

export const searchPreviousCues = (find: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        if (find === "") {
            return;
        }
        let fromIndex = getState().editingCueIndex >= 0 ? getState().editingCueIndex : 0;
        const cues = getState().cues;
        const matchedCueTextIndexes = matchCueText(cues[fromIndex], find);
        const lastCueTextMatchIndex = getState().searchReplace?.lastCueTextMatchIndex;
        if (matchedCueTextIndexes.length > 0
            && setPrevMatchInCue(dispatch, find, lastCueTextMatchIndex, fromIndex, matchedCueTextIndexes)) {
            return;
        }
        dispatch(searchReplaceSlice.actions.setSearchReplace({ find, lastCueTextMatchIndex: undefined }));
        fromIndex -= 1;
        const matchedIndex = findLastIndex(cues, cue => matchCueText(cue, find).length > 0, fromIndex);
        if (matchedIndex !== -1) {
            const matchedCueTextIndexes = matchCueText(cues[matchedIndex], find);
            const cueTextIndex = matchedCueTextIndexes.length - 1;
            setSearchReplaceForCueIndex(dispatch, find, matchedCueTextIndexes[cueTextIndex], matchedIndex);
        }
    };

export const searchReplaceAll = (find: string, replacement: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        if (find === "") {
            return;
        }
        const cues = getState().cues.slice(0);
        cues.forEach(cue => {
            if (matchCueText(cue, find)) {
                cue.vttCue.text = replace(cue.vttCue.text, find, replacement);
            }
        })
        dispatch(cuesSlice.actions.updateCues({ cues }));
        dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx: -1 }));
    };
