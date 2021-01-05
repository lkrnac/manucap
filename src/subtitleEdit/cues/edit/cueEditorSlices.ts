import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CueChange, CueDto, ScrollPosition, SubtitleEditAction } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";
import { scrollPositionSlice } from "../cuesListScrollSlice";
import { cuesSlice } from "../cuesListSlices";
import { editingTrackSlice } from "../../trackSlices";
import sanitizeHtml from "sanitize-html";
import { SearchDirection } from "../searchReplace/model";

export interface CueIndexAction extends SubtitleEditAction {
    idx: number;
}

export const editingCueIndexSlice = createSlice({
    name: "editingCueIndex",
    initialState: -1,
    reducers: {
        updateEditingCueIndex: (_state, action: PayloadAction<CueIndexAction>): number => action.payload.idx,
    },
    extraReducers: {
        [cuesSlice.actions.addCue.type]:
            (_state, action: PayloadAction<CueIndexAction>): number => action.payload.idx,
        [cuesSlice.actions.deleteCue.type]: (): number => -1,
        [cuesSlice.actions.updateCues.type]: (): number => -1,
    }
});

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
    const cue = getState().cues[idx];
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

export const updateEditingCueIndexNoThunk = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>,
    getState: Function,
    idx: number
): void => {
    dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx }));
    if (idx >= 0) {
        dispatch(scrollPositionSlice.actions.changeScrollPosition(ScrollPosition.CURRENT));
        updateSearchMatches(dispatch, getState, idx);
    }
};

export const updateEditingCueIndex = (idx: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState): void => {
        updateEditingCueIndexNoThunk(dispatch, getState, idx);
    };

export const validationErrorSlice = createSlice({
    name: "validationError",
    initialState: false,
    reducers: {
        setValidationError: (_state, action: PayloadAction<boolean>): boolean => action.payload
    },
    extraReducers: {
        [editingCueIndexSlice.actions.updateEditingCueIndex.type]: (): boolean => false
    }
});

export const setValidationError = (error: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean>>): void => {
        dispatch(validationErrorSlice.actions.setValidationError(error));
    };

export const lastCueChangeSlice = createSlice({
    name: "lastCueChange",
    initialState: null as CueChange | null,
    reducers: {
        recordCueChange: (_state, action: PayloadAction<CueChange | null>): CueChange | null =>
            action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CueChange | null => null
    }
});

export const glossaryTermSlice = createSlice({
    name: "glossaryTerm",
    initialState: null as string | null,
    reducers: {
        setGlossaryTerm: (_state, action: PayloadAction<string | null>): string | null => action.payload
    },
});

export const setGlossaryTerm = (term: string | null): AppThunk =>
    (dispatch: Dispatch<PayloadAction<string | null>>): void => {
        dispatch(glossaryTermSlice.actions.setGlossaryTerm(term));
    };

export const clearLastCueChange = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueChange | null>>): void => {
        dispatch(lastCueChangeSlice.actions.recordCueChange(null));
    };





