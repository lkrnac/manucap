import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CueDto,
    // CueDtoWithIndex,
    // CueLineDto,
    SubtitleEditAction } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";
import { editingTrackSlice } from "../../trackSlices";
import { SearchDirection, SearchReplace, SearchReplaceIndices,
    // SearchReplaceMatches
} from "./model";
import { mergeVisibleSlice } from "../merge/mergeSlices";
// import { updateMatchedCues } from "../cuesList/cuesListActions";
import sanitizeHtml from "sanitize-html";
import _ from "lodash";
import { updateEditingCueIndexNoThunk } from "../edit/cueEditorSlices";

const MAX = Number.MAX_SAFE_INTEGER;

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
        // setMatches: (state, action: PayloadAction<SearchReplaceMatches>): void => {
        //     state.matches = action.payload;
        // },
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): SearchReplace => initialSearchReplace,
        [mergeVisibleSlice.actions.setMergeVisible.type]: (): SearchReplace => initialSearchReplace,
        [searchReplaceVisibleSlice.actions.setSearchReplaceVisible.type]:
            (_state, action: PayloadAction<boolean>): SearchReplace =>
                action.payload ? _state : initialSearchReplace
    }
});

// const updateCueMatchesIfNeeded = (
//     dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
//     find: string,
//     matchCase: boolean,
//     getState: Function): void => {
//     const cueIndex = getState().editingCueIndex;
//     if (cueIndex !== -1) {
//         const currentCue = getState().cues[cueIndex];
//         const offsets = searchCueText(currentCue.vttCue.text, find, matchCase);
//         dispatch(searchReplaceSlice.actions.setMatches({ offsets, matchLength: find.length, offsetIndex: 0 }));
//     }
// };

export const setFind = (find: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(searchReplaceSlice.actions.setFind(find));
        // const matchCase = getState().searchReplace.matchCase;
        // updateCueMatchesIfNeeded(dispatch, find, matchCase, getState);
    };

export const setReplacement = (replacement: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(searchReplaceSlice.actions.setReplacement(replacement));
    };

export const setMatchCase = (matchCase: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(searchReplaceSlice.actions.setMatchCase(matchCase));
        // const find = getState().searchReplace.find;
        // updateCueMatchesIfNeeded(dispatch, find, matchCase, getState);
    };

export const showSearchReplace = (visible: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean | SubtitleEditAction>>): void => {
        dispatch(searchReplaceVisibleSlice.actions.setSearchReplaceVisible(visible));
        // const find = getState().searchReplace.find;
        // const matchCase = getState().searchReplace.matchCase;
        // updateCueMatchesIfNeeded(dispatch, find, matchCase, getState);
    };

const getNextCue = (
    dispatch: Dispatch<SubtitleEditAction>,
    getState: Function,
): CueDto | undefined => {
    const matchedCues = getState().matchedCues.matchedCues;
    const searchReplace = getState().searchReplace;
    const indices = _.clone(searchReplace.indices);
    indices.sourceCueIndex = indices.sourceCueIndex == -1 ? MAX : indices.sourceCueIndex;
    indices.targetCueIndex = indices.targetCueIndex == -1 ? MAX : indices.targetCueIndex;

    let matchedCueIndex = indices.matchedCueIndex;
    let sourceCueIndex = indices.sourceCueIndex;
    let targetCueIndex = indices.targetCueIndex;
    let offsetIndex = indices.offsetIndex;

    for (
        ;
        matchedCueIndex <= matchedCues.length - 1;
        matchedCueIndex++, sourceCueIndex = -1, targetCueIndex = -1, offsetIndex = 0
    ) {
        const matchedCue = matchedCues[matchedCueIndex];
        if (matchedCue) {
            for (
                ;
                sourceCueIndex < matchedCue.sourceCues?.length;
                sourceCueIndex++, targetCueIndex = -1, offsetIndex = 0
            ) {
                const sourceCue =  matchedCue.sourceCues[sourceCueIndex];
                if (sourceCue) {
                    const offsets = searchCueText(
                        sourceCue.cue.vttCue.text,
                        searchReplace.find,
                        searchReplace.matchCase
                    );
                    for (; offsetIndex < offsets.length; offsetIndex++) {
                        const currentIndices = {
                            matchedCueIndex,
                            sourceCueIndex,
                            targetCueIndex: MAX,
                            matchLength: searchReplace.find.length,
                            offset: offsets[offsetIndex],
                            offsetIndex
                        };
                        if (!_.isEqual(indices, currentIndices)) {
                            dispatch(searchReplaceSlice.actions.setIndices(currentIndices));
                            updateEditingCueIndexNoThunk(dispatch, -1);
                            return sourceCue.cue;
                        }
                    }
                }
            }
            for (; targetCueIndex < matchedCue.targetCues?.length; targetCueIndex++, offsetIndex = 0) {
                const targetCue = matchedCue.targetCues[targetCueIndex];
                if (targetCue) {
                    const offsets = searchCueText(
                        targetCue.cue.vttCue.text,
                        searchReplace.find,
                        searchReplace.matchCase
                    );
                    for (; offsetIndex < offsets.length; offsetIndex++) {
                        const currentIndices = {
                            matchedCueIndex,
                            sourceCueIndex: MAX,
                            targetCueIndex,
                            matchLength: searchReplace.find.length,
                            offset: offsets[offsetIndex],
                            offsetIndex
                        };
                        if (!_.isEqual(indices, currentIndices)) {
                            dispatch(searchReplaceSlice.actions.setIndices(currentIndices));
                            updateEditingCueIndexNoThunk(dispatch, targetCue.index);
                            return targetCue.cue;
                        }
                    }
                }
            }
        }
    }
    return undefined;
};

const getPreviousCue = (
    dispatch: Dispatch<SubtitleEditAction>,
    getState: Function,
): CueDto | undefined => {
    const matchedCues = getState().matchedCues.matchedCues;
    const searchReplace = getState().searchReplace;
    const indices = _.clone(searchReplace.indices);
    indices.sourceCueIndex = indices.sourceCueIndex == MAX ? -1 : indices.sourceCueIndex;
    indices.targetCueIndex = indices.targetCueIndex == MAX ? -1 : indices.targetCueIndex;

    let matchedCueIndex = indices.matchedCueIndex;
    let sourceCueIndex = indices.sourceCueIndex;
    let targetCueIndex = indices.targetCueIndex;
    let offsetIndex = indices.offsetIndex;

    for (
        ;
        matchedCueIndex >= 0;
        matchedCueIndex--, sourceCueIndex = MAX, targetCueIndex = MAX, offsetIndex = MAX
    ) {
        const matchedCue = matchedCues[matchedCueIndex];
        if (matchedCue) {
            for (
                ;
                targetCueIndex > -1;
                targetCueIndex--, sourceCueIndex = MAX, offsetIndex = MAX
            ) {
                const targetCue = matchedCue.targetCues[targetCueIndex];
                if (targetCue) {
                    const offsets = searchCueText(
                        targetCue.cue.vttCue.text,
                        searchReplace.find,
                        searchReplace.matchCase
                    );
                    if (offsetIndex === MAX) {
                        offsetIndex = offsets.length - 1;
                    }
                    for (; offsetIndex > -1; offsetIndex--) {
                        const currentIndices = {
                            matchedCueIndex,
                            sourceCueIndex: -1,
                            targetCueIndex,
                            matchLength: searchReplace.find.length,
                            offset: offsets[offsetIndex],
                            offsetIndex
                        };
                        if (!_.isEqual(indices, currentIndices)) {
                            dispatch(searchReplaceSlice.actions.setIndices(currentIndices));
                            updateEditingCueIndexNoThunk(dispatch, targetCue.index);
                            return targetCue.cue;
                        }
                    }
                } else {
                    targetCueIndex = matchedCue.targetCues.length;
                }
            }
            for (
                ;
                sourceCueIndex > -1;
                sourceCueIndex--, offsetIndex = MAX
            ) {
                const sourceCue =  matchedCue.sourceCues[sourceCueIndex];
                if (sourceCue) {
                    const offsets = searchCueText(
                        sourceCue.cue.vttCue.text,
                        searchReplace.find,
                        searchReplace.matchCase
                    );
                    if (offsetIndex === MAX) {
                        offsetIndex = offsets.length - 1;
                    }
                    for (; offsetIndex > -1; offsetIndex--) {
                        const currentIndices = {
                            matchedCueIndex,
                            sourceCueIndex,
                            targetCueIndex: -1,
                            matchLength: searchReplace.find.length,
                            offset: offsets[offsetIndex],
                            offsetIndex
                        };
                        if (!_.isEqual(indices, currentIndices)) {
                            dispatch(searchReplaceSlice.actions.setIndices(currentIndices));
                            updateEditingCueIndexNoThunk(dispatch, -1);
                            return sourceCue.cue;
                        }
                    }
                } else {
                    sourceCueIndex = matchedCue.sourceCues.length;
                }
            }
        }
    }
    return undefined;
};

const getCueAndUpdateIndices = (
    dispatch: Dispatch<SubtitleEditAction>,
    getState: Function,
    // editingCueIndex: number,
): CueDto | undefined => {
    const matchedCues = getState().matchedCues.matchedCues;
    if (matchedCues.length === 0) {
        return;
    }
    const searchReplace = getState().searchReplace;
    // const indices = searchReplace.indices;
    // let matchedCueIndex = indices.matchedCueIndex;
    // let sourceCueIndex = indices.sourceCueIndex;
    // let targetCueIndex = indices.targetCueIndex;
    // if (matchedCueIndex === -1) { // if starting search
    //     if (editingCueIndex !== -1) { // if user is editing a cue, start there
    //         matchedCueIndex = _.findIndex(matchedCues, (cueLineDto: CueLineDto): boolean => {
    //             if (cueLineDto.targetCues) {
    //                 const targetCue = cueLineDto.targetCues.find(targetCue => targetCue.index === editingCueIndex);
    //                 if (targetCue) {
    //                     targetCueIndex = targetCue.index - 1; // will be increased below
    //                     return true;
    //                 }
    //             }
    //             return false;
    //         });
    //         if (targetCueIndex !== -1) {
  //             const matchedCueWithLastSourceCueIndex = _.findIndex(matchedCues, (cueLineDto: CueLineDto): boolean =>
    //                 cueLineDto.sourceCues ? cueLineDto.sourceCues.length > 0 : false, matchedCueIndex);
    //             if (matchedCueWithLastSourceCueIndex !== -1) {
    //                 const lastSourceCue = matchedCues[matchedCueWithLastSourceCueIndex].sourceCues.at(-1);
    //                 sourceCueIndex = lastSourceCue?.index;
    //             }
    //         }
    //         dispatch(searchReplaceSlice.actions.setIndices(
    //             { ...indices, matchedCueIndex, sourceCueIndex, targetCueIndex }));
    //     } else {
    //         const direction = getState().searchReplace.direction;
    //         direction === "NEXT" ? matchedCueIndex++ : matchedCueIndex = matchedCues.length - 1;
    //         dispatch(searchReplaceSlice.actions.setIndices({ ...indices, matchedCueIndex }));
    //     }
    // }
    return searchReplace.direction === "NEXT"
        ? getNextCue(dispatch, getState)
        : getPreviousCue(dispatch, getState);
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

// const finNextOffsetIndexForSearch = (
//     offsets: Array<number>,
//     searchReplace: SearchReplace
// ): number => {
//     const lastIndex = offsets.length - 1;
//     return searchReplace.direction === "NEXT" ? 0 : lastIndex;
// };

export const searchNextCues = (
    // replacement: boolean
): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        const find = getState().searchReplace.find;
        if (find === "") {
            return;
        }
        dispatch(searchReplaceSlice.actions.setDirection("NEXT"));
        // let editingCueIndex = getState().editingCueIndex;
        // const currentMatches = getState().searchReplace.matches;
        // if (currentMatches) {
        //     if (currentMatches.offsetIndex < currentMatches.offsets.length - 1) {
        //         const offsetShift = replacement ? 0 : 1;
        //         dispatch(searchReplaceSlice.actions.setMatches(
        //             { ...currentMatches, offsetIndex: currentMatches.offsetIndex + offsetShift }
        //         ));
        //         // TODO: check if this is needed
        //         dispatch(updateMatchedCues());
        //         return;
        //     }
        //     // else {
        //     //     editingCueIndex++;
        //     // }
        // }
        getCueAndUpdateIndices(dispatch, getState);
        // if (currentCue) {
        //     updateSearchMatches(dispatch, getState, currentCue);
        //     if (getState().searchReplace.indices.targetCueIndex > 0) {
        //         updateEditingCueIndexNoThunk(dispatch, getState, getState().searchReplace.indices.targetCueIndex);
        //     }
        // }
    };

export const searchPreviousCues = (): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        const find = getState().searchReplace.find;
        if (find === "") {
            return;
        }
        dispatch(searchReplaceSlice.actions.setDirection("PREVIOUS"));
        // let editingCueIndex = getState().editingCueIndex;
        // const currentMatches = getState().searchReplace.matches;
        // if (currentMatches) {
        //     if (currentMatches.offsetIndex > 0) {
        //         dispatch(searchReplaceSlice.actions.setMatches(
        //             { ...currentMatches, offsetIndex: currentMatches.offsetIndex - 1 }
        //         ));
        //         // TODO: check if this is needed
        //         dispatch(updateMatchedCues());
        //         return;
        //     }
        //     // else {
        //     //     editingCueIndex--;
        //     // }
        // }
        getCueAndUpdateIndices(dispatch, getState);
        // if (currentCue) {
        //     updateSearchMatches(dispatch, getState, currentCue);
        //     // if (getState().searchReplace.indices.targetCueIndex > 0) {
        //     //     updateEditingCueIndexNoThunk(dispatch, getState, getState().searchReplace.indices.targetCueIndex);
        //     // }
        // }
    };

export const replaceCurrentMatch = (replacement: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<string>>): void => {
        dispatch(searchReplaceSlice.actions.replaceMatchSignal(replacement));
    };
