import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CueDto, CueDtoWithIndex, CueLineDto, SubtitleEditAction } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";
import { editingTrackSlice } from "../../trackSlices";
import { SearchDirection, SearchReplace, SearchReplaceIndices, SearchReplaceMatches } from "./model";
import { mergeVisibleSlice } from "../merge/mergeSlices";
import { updateMatchedCues } from "../cuesList/cuesListActions";
import sanitizeHtml from "sanitize-html";
import _ from "lodash";
import { updateEditingCueIndexNoThunk } from "../edit/cueEditorSlices";

const getNextCue = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    getState: Function,
    previousDirection: string
    ): CueDto => {
    const matchedCues = getState().matchedCues.matchedCues;
    const searchReplace = getState().searchReplace;
    let currentCue = undefined as unknown as CueDto;
    const indices = searchReplace.indices;
    let matchedCueIndex = indices.matchedCueIndex;
    let sourceCueIndex = indices.sourceCueIndex;
    let targetCueIndex = indices.targetCueIndex;
    let isSourceCue = indices.isSourceCue;
    let foundMatch = false;
    let matchedCue = matchedCues[matchedCueIndex];
    if (previousDirection !== "NEXT") {
        sourceCueIndex = getFirstSourceCueIndex(matchedCue);
        targetCueIndex = getLastTargetCueIndex(matchedCue);
    }
    do {
        matchedCue = matchedCues[matchedCueIndex];
        if (matchedCue) {
            if (matchedCue.sourceCues && matchedCue.sourceCues.length > 0) {
                sourceCueIndex++;
                const sourceCue = matchedCue.sourceCues.find((cue: CueDtoWithIndex) => cue.index === sourceCueIndex);
                if (sourceCue) {
                    foundMatch = searchCueText(sourceCue.cue.vttCue.text, searchReplace.find,
                        searchReplace.matchCase).length > 0;
                    if (foundMatch) {
                        currentCue = sourceCue.cue;
                        isSourceCue = true;
                        break;
                    } else {
                        continue;
                    }
                } else {
                    sourceCueIndex--;
                }
            }
            if (matchedCue.targetCues && matchedCue.targetCues.length > 0) {
                targetCueIndex++;
                const targetCue = matchedCue.targetCues.find((cue: CueDtoWithIndex) => cue.index === targetCueIndex);
                if (targetCue) {
                    foundMatch = searchCueText(targetCue.cue.vttCue.text, searchReplace.find,
                        searchReplace.matchCase).length > 0;
                    if (foundMatch) {
                        currentCue = targetCue.cue;
                        isSourceCue = false;
                        break;
                    } else {
                        continue;
                    }
                } else {
                    targetCueIndex--;
                }
            }
        }
        if (!currentCue) {
            matchedCueIndex++;
        }
    } while (!currentCue && sourceCueIndex !== 9999 && targetCueIndex !== 9999);
    dispatch(searchReplaceSlice.actions.setIndices({ matchedCueIndex, sourceCueIndex, targetCueIndex, isSourceCue }));
    return currentCue;
};

const getPreviousCue = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    getState: Function,
    previousDirection: string): CueDto => {
    const matchedCues = getState().matchedCues.matchedCues;
    const searchReplace = getState().searchReplace;
    let currentCue = undefined as unknown as CueDto;
    const indices = searchReplace.indices;
    let matchedCueIndex = indices.matchedCueIndex;
    let sourceCueIndex = indices.sourceCueIndex;
    let targetCueIndex = indices.targetCueIndex;
    let isSourceCue = indices.isSourceCue;
    let foundMatch = false;
    let matchedCue = matchedCues[matchedCueIndex];
    if (previousDirection !== "PREVIOUS") {
        sourceCueIndex = getLastSourceCueIndex(matchedCue);
        targetCueIndex = getFirstTargetCueIndex(matchedCue);
    }
    do {
        matchedCue = matchedCues[matchedCueIndex];
        if (matchedCue) {
            if (matchedCue.targetCues && matchedCue.targetCues.length > 0) {
                targetCueIndex--;
                const targetCue = matchedCue.targetCues.find((cue: CueDtoWithIndex) => cue.index === targetCueIndex);
                if (targetCue) {
                    foundMatch = searchCueText(targetCue.cue.vttCue.text, searchReplace.find,
                        searchReplace.matchCase).length > 0;
                    if (foundMatch) {
                        currentCue = targetCue.cue;
                        isSourceCue = false;
                        break;
                    } else {
                        continue;
                    }
                } else {
                    targetCueIndex++;
                }
            }
            if (matchedCue.sourceCues && matchedCue.sourceCues.length > 0) {
                sourceCueIndex--;
                const sourceCue = matchedCue.sourceCues.find((cue: CueDtoWithIndex) => cue.index === sourceCueIndex);
                if (sourceCue) {
                    foundMatch = searchCueText(sourceCue.cue.vttCue.text, searchReplace.find,
                        searchReplace.matchCase).length > 0;
                    if (foundMatch) {
                        currentCue = sourceCue.cue;
                        isSourceCue = true;
                        break;
                    } else {
                        continue;
                    }
                } else {
                    sourceCueIndex++;
                }
            }
        }
        if (!currentCue) {
            matchedCueIndex--;
        }
    } while (!currentCue && sourceCueIndex !== 9999 && targetCueIndex !== 9999);
    dispatch(searchReplaceSlice.actions.setIndices({ matchedCueIndex, sourceCueIndex, targetCueIndex, isSourceCue }));
    return currentCue;
};

const getFirstSourceCueIndex = (matchedCue: CueLineDto): number => {
    if (matchedCue.sourceCues && matchedCue.sourceCues.length > 0) {
        return matchedCue.sourceCues[0].index;
    }
    return -1;
};

const getLastSourceCueIndex = (matchedCue: CueLineDto): number => {
    if (matchedCue.sourceCues && matchedCue.sourceCues.length > 0) {
        return matchedCue.sourceCues[matchedCue.sourceCues.length - 1].index;
    }
    return -1;
};

const getFirstTargetCueIndex = (matchedCue: CueLineDto): number => {
    if (matchedCue.targetCues && matchedCue.targetCues.length > 0) {
        return matchedCue.targetCues[0].index;
    }
    return -1;
};

const getLastTargetCueIndex = (matchedCue: CueLineDto): number => {
    if (matchedCue.targetCues && matchedCue.targetCues.length > 0) {
        return matchedCue.targetCues[matchedCue.targetCues.length - 1].index;
    }
    return -1;
};

const getCueAndUpdateIndices = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    getState: Function,
    editingCueIndex: number,
    previousDirection: string
): CueDto | undefined => {
    const matchedCues = getState().matchedCues.matchedCues;
    if (matchedCues.length === 0) {
        return;
    }
    const searchReplace = getState().searchReplace;
    const indices = searchReplace.indices;
    let matchedCueIndex = indices.matchedCueIndex;
    let sourceCueIndex = indices.sourceCueIndex;
    let targetCueIndex = indices.targetCueIndex;
    if (matchedCueIndex === -1) { // if starting search
        if (editingCueIndex !== -1) { // if user is editing a cue, start there
            matchedCueIndex = _.findIndex(matchedCues, (cueLineDto: CueLineDto): boolean => {
                if (cueLineDto.targetCues) {
                    const targetCue = cueLineDto.targetCues.find(targetCue => targetCue.index === editingCueIndex);
                    if (targetCue) {
                        targetCueIndex = targetCue.index - 1; // will be increased below
                        return true;
                    }
                }
                return false;
            });
            if (targetCueIndex !== -1) {
                const matchedCueWithLastSourceCueIndex = _.findIndex(matchedCues, (cueLineDto: CueLineDto): boolean =>
                    cueLineDto.sourceCues ? cueLineDto.sourceCues.length > 0 : false, matchedCueIndex);
                if (matchedCueWithLastSourceCueIndex !== -1) {
                    const lastSourceCue = matchedCues[matchedCueWithLastSourceCueIndex].sourceCues.at(-1);
                    sourceCueIndex = lastSourceCue?.index;
                    dispatch(searchReplaceSlice.actions.setIndices(
                        { ...indices, matchedCueIndex, sourceCueIndex, targetCueIndex }));
                }
            }
        } else { // start from first line
            matchedCueIndex++;
            dispatch(searchReplaceSlice.actions.setIndices({ ...indices, matchedCueIndex }));
        }
    }
    return searchReplace.direction === "NEXT"
        ? getNextCue(dispatch, getState, previousDirection)
        : getPreviousCue(dispatch, getState, previousDirection);
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
        dispatch(searchReplaceSlice.actions.setMatches({ offsets, matchLength: find.length, offsetIndex: 0 }));
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
    direction: "NEXT",
    indices: {
        matchedCueIndex: -1,
        sourceCueIndex: -1,
        targetCueIndex: -1,
        isSourceCue: true
    }
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
        },
        setIndices: (state, action: PayloadAction<SearchReplaceIndices>): void => {
            state.indices = action.payload;
        },
        setMatches: (state, action: PayloadAction<SearchReplaceMatches>): void => {
            state.matches = action.payload;
        },
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): SearchReplace => initialSearchReplace,
        [mergeVisibleSlice.actions.setMergeVisible.type]: (): SearchReplace => initialSearchReplace,
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
    offsets: Array<number>,
    searchReplace: SearchReplace
): number => {
    const lastIndex = offsets.length - 1;
    return searchReplace.direction === "NEXT" ? 0 : lastIndex;
};

export const updateSearchMatches = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>,
    getState: Function,
    cue: CueDto
): void => {
    const searchReplace = getState().searchReplace;
    if (cue) {
        const offsets = searchCueText(cue.vttCue.text, searchReplace.find, searchReplace.matchCase);
        const offsetIndex = finNextOffsetIndexForSearch(offsets, searchReplace);
        dispatch(searchReplaceSlice.actions.setMatches(
            { offsets, matchLength: searchReplace.find.length, offsetIndex }
        ));
    }
};

export const searchNextCues = (replacement: boolean): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        const searchReplaceVisible = getState().searchReplaceVisible;
        const previousDirection = getState().searchReplace.direction;
        if (!searchReplaceVisible) {
            return;
        }
        const find = getState().searchReplace.find;
        if (find === "") {
            return;
        }
        dispatch(searchReplaceSlice.actions.setDirection("NEXT"));
        const editingCueIndex = getState().editingCueIndex;
        const currentMatches = getState().searchReplace.matches;
        if (currentMatches) {
            if (currentMatches.offsetIndex < currentMatches.offsets.length - 1) {
                const offsetShift = replacement ? 0 : 1;
                dispatch(searchReplaceSlice.actions.setMatches(
                    { ...currentMatches, offsetIndex: currentMatches.offsetIndex + offsetShift }
                ));
                // TODO: check if this is needed
                dispatch(updateMatchedCues());
                return;
            }
        }
        const currentCue = getCueAndUpdateIndices(dispatch, getState, editingCueIndex, previousDirection);
        if (currentCue) {
            updateSearchMatches(dispatch, getState, currentCue);
            if (!getState().searchReplace.indices.isSourceCue) {
                updateEditingCueIndexNoThunk(dispatch, getState, getState().searchReplace.indices.targetCueIndex);
            }
        }
    };

export const searchPreviousCues = (): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        const searchReplaceVisible = getState().searchReplaceVisible;
        const previousDirection = getState().searchReplace.direction;
        if (!searchReplaceVisible) {
            return;
        }
        const find = getState().searchReplace.find;
        if (find === "") {
            return;
        }
        dispatch(searchReplaceSlice.actions.setDirection("PREVIOUS"));
        const editingCueIndex = getState().editingCueIndex;
        const currentMatches = getState().searchReplace.matches;
        if (currentMatches) {
            if (currentMatches.offsetIndex > 0) {
                dispatch(searchReplaceSlice.actions.setMatches(
                    { ...currentMatches, offsetIndex: currentMatches.offsetIndex - 1 }
                ));
                // TODO: check if this is needed
                dispatch(updateMatchedCues());
                return;
            }
        }
        const currentCue = getCueAndUpdateIndices(dispatch, getState, editingCueIndex, previousDirection);
        if (currentCue) {
            updateSearchMatches(dispatch, getState, currentCue);
            if (!getState().searchReplace.indices.isSourceCue) {
                updateEditingCueIndexNoThunk(dispatch, getState, getState().searchReplace.indices.targetCueIndex);
            }
        }
    };

export const replaceCurrentMatch = (replacement: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<string>>): void => {
        dispatch(searchReplaceSlice.actions.replaceMatchSignal(replacement));
    };
