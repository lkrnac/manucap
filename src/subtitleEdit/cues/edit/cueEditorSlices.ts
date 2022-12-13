import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CueChange, CueDto, CueError, ScrollPosition, SubtitleEditAction } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";
import { changeScrollPosition } from "../cuesList/cuesListScrollSlice";
import { cuesSlice } from "../cuesList/cuesListSlices";
import { editingTrackSlice } from "../../trackSlices";
import sanitizeHtml from "sanitize-html";
import { SearchDirection } from "../searchReplace/model";
import { mergeVisibleSlice } from "../merge/mergeSlices";
import { updateMatchedCues } from "../cuesList/cuesListActions";
import _ from "lodash";

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
        // TODO Revert when fixed: https://dotsub.atlassian.net/browse/DSD-1192
        [cuesSlice.actions.updateCues.type]: (): number => -1,
        [mergeVisibleSlice.actions.setMergeVisible.type]: (): number => -1
    }
});

type FocusedInputType = "EDITOR" | "START_TIME";

export const focusedInputSlice = createSlice({
    name: "focusedInput",
    initialState: "EDITOR" as FocusedInputType,
    reducers: {
        updateFocusedInput: (_state, action: PayloadAction<FocusedInputType>): FocusedInputType => action.payload
    }
});

// Sourced from SO https://stackoverflow.com/a/3561711 See post for eslint disable about escaping /
/* eslint-disable no-useless-escape */
const escapeRegex = (value: string): string =>
    value.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
/* eslint-enable */

export const searchCueText = (text: string, find: string, matchCase: boolean): Array<number> => {
    if (find === "") {
        return [];
    }
    const plainText = sanitizeHtml(text, { allowedTags: []});
    if (plainText === "") {
        return [];
    }
    const regExpFlag = matchCase ? "g" : "gi";
    const re = new RegExp(escapeRegex(find), regExpFlag);
    const results = [];
    const plainTextUnescaped = _.unescape(plainText);
    while (re.exec(plainTextUnescaped)){
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
    dispatch: Dispatch<SubtitleEditAction>,
    getState: Function,
    idx: number
): void => {
    dispatch(focusedInputSlice.actions.updateFocusedInput("EDITOR"));
    dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx }));
    if (idx >= 0) {
        const state = getState();
        if (state.searchReplaceVisible) {
            updateSearchMatches(dispatch, getState, idx);
        }
        dispatch(updateMatchedCues());
        dispatch(changeScrollPosition(ScrollPosition.CURRENT));
    }
};

export const updateEditingCueIndex = (idx: number): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        updateEditingCueIndexNoThunk(dispatch, getState, idx);
    };

export const validationErrorSlice = createSlice({
    name: "validationError",
    initialState: [] as CueError[],
    reducers: {
        setValidationErrors: (_state, action: PayloadAction<CueError[]>): CueError[] => action.payload
    },
    extraReducers: {
        [editingCueIndexSlice.actions.updateEditingCueIndex.type]: (): CueError[] => []
    }
});

export const setValidationErrors = (errors: CueError[]): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueError[]>>): void => {
        dispatch(validationErrorSlice.actions.setValidationErrors(errors));
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

export const clearLastCueChange = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueChange | null>>): void => {
        dispatch(lastCueChangeSlice.actions.recordCueChange(null));
    };





