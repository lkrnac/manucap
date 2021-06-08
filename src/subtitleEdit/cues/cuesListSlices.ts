import _ from "lodash";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
    CueCategory,
    CueDto,
    CueDtoWithIndex,
    CueError,
    CuesWithRowIndex,
    GlossaryMatchDto,
    SubtitleEditAction
} from "../model";
import { copyNonConstructorProperties } from "./cueUtils";
import { editingTrackSlice } from "../trackSlices";
import { Match, SpellCheck } from "./spellCheck/model";
import { SearchReplaceMatches } from "./searchReplace/model";
import { hasIgnoredKeyword } from "./spellCheck/spellCheckerUtils";
import { mergeVisibleSlice } from "./merge/mergeSlices";

export interface CueIndexAction extends SubtitleEditAction {
    idx: number;
}

export interface VttCueAction extends CueIndexAction {
    vttCue: VTTCue;
    editUuid?: string;
}

export interface CueCategoryAction extends CueIndexAction {
    cueCategory: CueCategory;
}

export interface CueAction extends CueIndexAction {
    cue: CueDto;
}

interface CuesAction extends SubtitleEditAction {
    cues: CueDto[];
}

export interface CueErrorsPayload {
    errors: CueError[];
    index: number;
}

export interface SpellCheckAction extends CueIndexAction {
    spellCheck: SpellCheck;
}

export interface SearchReplaceAction extends CueIndexAction {
    searchMatches: SearchReplaceMatches;
}

export interface SpellCheckRemovalAction extends CueIndexAction {
    trackId: string;
}

export interface RowsAction {
    rows: CuesWithRowIndex[];
}

export const cuesSlice = createSlice({
    name: "cues",
    initialState: [] as CueDto[],
    reducers: {
        updateVttCue: (state, action: PayloadAction<VttCueAction>): void => {
            state[action.payload.idx].vttCue = action.payload.vttCue;
            state[action.payload.idx].editUuid = action.payload.editUuid;
        },
        updateCueCategory: (state, action: PayloadAction<CueCategoryAction>): void => {
            if (state[action.payload.idx]) {
                state[action.payload.idx].cueCategory = action.payload.cueCategory;
            }
        },
        addSpellCheck: (state, action: PayloadAction<SpellCheckAction>): void => {
            state[action.payload.idx].spellCheck = action.payload.spellCheck;
        },
        addSearchMatches: (state, action: PayloadAction<SearchReplaceAction>): void => {
            state[action.payload.idx].searchReplaceMatches = action.payload.searchMatches;
        },
        removeIgnoredSpellcheckedMatchesFromAllCues: (state,
                                                      action: PayloadAction<SpellCheckRemovalAction>): void => {
            const trackId = action.payload.trackId;
            state.filter((cue: CueDto) => cue.spellCheck != null && cue.spellCheck.matches != null)
                .forEach(cue => {
                    //@ts-ignore false positive spellcheck is never null here
                    cue.spellCheck.matches = cue.spellCheck.matches.filter((match: Match) =>
                        !hasIgnoredKeyword(match, trackId));
                });
        },
        addCue: (state, action: PayloadAction<CueAction>): void => {
            state.splice(action.payload.idx, 0, action.payload.cue);
        },
        deleteCue: (state, action: PayloadAction<CueIndexAction>): void => {
            if (state.length > 1) {
                state.splice(action.payload.idx, 1);
            } else {
                // default empty cue
                const newVttCue = new VTTCue(0, 3, "");
                // this is a hack just to avoid uninitialized properties
                copyNonConstructorProperties(newVttCue, newVttCue);
                state[0] = {
                    vttCue: newVttCue,
                    cueCategory: "DIALOGUE"
                };
            }
        },
        updateCues: (_state, action: PayloadAction<CuesAction>): CueDto[] => action.payload.cues,
        applyShiftTime: (state, action: PayloadAction<number>): CueDto[] => {
            const shift = action.payload;
            return state.map((cue: CueDto) => {
                if (cue.editDisabled) {
                    return cue;
                }
                const vttCue = cue.vttCue;
                const startTime = vttCue.startTime + shift;
                const endTime = vttCue.endTime + shift;
                const newCue = new VTTCue(startTime, endTime, vttCue.text);
                copyNonConstructorProperties(newCue, vttCue);
                return ({ ...cue, vttCue: newCue } as CueDto);
            });
        },
        setErrors: (state, action: PayloadAction<CueErrorsPayload>): void => {
            state[action.payload.index].errors = action.payload.errors;
        },
        syncCues: (state, action: PayloadAction<CuesAction>): CueDto[] => {
            const sourceCues = action.payload.cues;
            return state.map((cue: CueDto, index: number) => {
                if (cue.editDisabled) {
                    return cue;
                }
                const vttCue = cue.vttCue;
                const startTime = sourceCues[index].vttCue.startTime;
                const endTime = sourceCues[index].vttCue.endTime;
                const newCue = new VTTCue(startTime, endTime, vttCue.text);
                copyNonConstructorProperties(newCue, vttCue);
                return ({ ...cue, vttCue: newCue } as CueDto);
            });
        },
        mergeCues: (state, action: PayloadAction<RowsAction>): CueDto[] => {
            const rowsToMerge = _.sortBy(action.payload.rows, row => row.index);
            let mergedContent = "";
            let mergedErrors = null as CueError[] | null;
            let mergedGlossaryMatches = null as GlossaryMatchDto[] | null;
            // let mergedSearchReplaceMatches = null as SearchReplaceMatches[] | null;
            let rowStartTime = 0;
            let rowEndTime = 0;
            let firstCue = {} as CueDtoWithIndex;
            let lastCue = {} as CueDtoWithIndex;
            rowsToMerge.forEach((row: CuesWithRowIndex, rowIndex: number, rows: CuesWithRowIndex[]) => {
                row.cues?.forEach((cue: CueDtoWithIndex, cueIndex: number, cues: CueDtoWithIndex[]) => {
                    if (cue.cue.errors && cue.cue.errors.length > 0) {
                        if (!mergedErrors) {
                            mergedErrors = cue.cue.errors;
                        } else {
                            mergedErrors.push(...cue.cue.errors);
                        }
                    }
                    if (cue.cue.glossaryMatches && cue.cue.glossaryMatches.length > 0) {
                        if (!mergedGlossaryMatches) {
                            mergedGlossaryMatches = cue.cue.glossaryMatches;
                        } else {
                            mergedGlossaryMatches.push(...cue.cue.glossaryMatches);
                        }
                    }
                    // TODO: fix this
                    // if (cue.cue.searchReplaceMatches && cue.cue.searchReplaceMatches.matchLength > 0) {
                    //     if (!mergedSearchReplaceMatches) {
                    //         mergedSearchReplaceMatches = cue.cue.searchReplaceMatches;
                    //     } else {
                    //         mergedSearchReplaceMatches.push(...cue.cue.searchReplaceMatches);
                    //     }
                    // }
                    if (rowIndex === 0 && cueIndex === 0) {
                        firstCue = cue;
                        rowStartTime = cue.cue.vttCue.startTime;
                    } else {
                        mergedContent += "\n";
                    }
                    if (rowIndex === rows.length - 1 && cueIndex === cues.length - 1) {
                        lastCue = cue;
                        rowEndTime = cue.cue.vttCue.endTime;
                    }
                    mergedContent += cue.cue.vttCue.text;
                });
            });
            state[firstCue.index] = {
                vttCue: {
                    ...firstCue.cue.vttCue,
                    text: mergedContent,
                    startTime: rowStartTime,
                    endTime: rowEndTime
                },
                errors: mergedErrors,
                glossaryMatches: mergedGlossaryMatches,
                editUuid: firstCue.cue.editUuid,
                cueCategory: firstCue.cue.cueCategory
            } as CueDto;
            state.splice(firstCue.index + 1, lastCue.index - firstCue.index);
            return state;
        }
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CueDto[] => [],
    }
});

export const mergeSlice = createSlice({
    name: "rowsToMerge",
    initialState: [] as CuesWithRowIndex[],
    reducers: {
        addRowCues: (state, action: PayloadAction<CuesWithRowIndex>): void => {
            state.push(action.payload);
        },
        removeRowCues: (state, action: PayloadAction<CuesWithRowIndex>): void => {
            // TODO: do i need to reassign the state?
            _.remove(state, (row) => row.index === action.payload.index);
        }
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CuesWithRowIndex[] => [],
        [cuesSlice.actions.mergeCues.type]: (): CuesWithRowIndex[] => [],
        [mergeVisibleSlice.actions.setMergeVisible.type]:
            (_state, action: PayloadAction<CuesWithRowIndex>): CuesWithRowIndex[] => action.payload ? _state : []
    }
});
