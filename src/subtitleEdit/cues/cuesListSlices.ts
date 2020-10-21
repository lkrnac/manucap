import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CueCategory, CueChange, CueDto, SubtitleEditAction } from "../model";
import {
    copyNonConstructorProperties
} from "./cueUtils";
import { editingTrackSlice } from "../trackSlices";
import { SubtitleSpecificationAction, subtitleSpecificationSlice } from "../toolbox/subtitleSpecificationSlice";
import {
    conformToRules,
    markCues,
} from "./cueVerifications";
import { Match, SpellCheck } from "./spellCheck/model";
import { SearchReplaceMatches } from "./searchReplace/model";
import { hasIgnoredKeyword } from "./spellCheck/spellCheckerUtils";

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

interface CheckOptions extends SubtitleSpecificationAction {
    overlapEnabled?: boolean;
    index?: number;
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

export const cuesSlice = createSlice({
    name: "cues",
    initialState: [] as CueDto[],
    reducers: {
        updateVttCue: (state, action: PayloadAction<VttCueAction>): void => {
            state[action.payload.idx] = {
                ...state[action.payload.idx],
                vttCue: action.payload.vttCue,
                editUuid: action.payload.editUuid
            };
        },
        updateCueCategory: (state, action: PayloadAction<CueCategoryAction>): void => {
            if (state[action.payload.idx]) {
                state[action.payload.idx] = {
                    ...state[action.payload.idx],
                    cueCategory: action.payload.cueCategory
                };
            }
        },
        addSpellCheck: (state, action: PayloadAction<SpellCheckAction>): void => {
            state[action.payload.idx] = {
                ...state[action.payload.idx],
                spellCheck: action.payload.spellCheck
            };
        },
        addSearchMatches: (state, action: PayloadAction<SearchReplaceAction>): void => {
            state[action.payload.idx] = {
                ...state[action.payload.idx],
                searchReplaceMatches: action.payload.searchMatches
            };
        },
        removeIgnoredSpellcheckedMatchesFromAllCues: (state,
                                                     action: PayloadAction<SpellCheckRemovalAction>): void => {
            const trackId = action.payload.trackId;
            state.filter((cue: CueDto) => cue.spellCheck != null && cue.spellCheck.matches != null)
                .forEach(cue => {
                    //@ts-ignore false positive spellcheck is never null here
                    cue.spellCheck.matches = cue.spellCheck.matches.filter((match: Match) =>
                        !hasIgnoredKeyword(trackId, match));
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
                const vttCue = cue.vttCue;
                const startTime = vttCue.startTime + shift;
                const endTime = vttCue.endTime + shift;
                const newCue = new VTTCue(startTime, endTime, vttCue.text);
                copyNonConstructorProperties(newCue, vttCue);
                return ({ ...cue, vttCue: newCue } as CueDto);
            });
        },
        checkErrors: (state, action: PayloadAction<CheckOptions>): void => {
            const index = action.payload.index;
            if (index !== undefined) {
                const subtitleSpecification = action.payload.subtitleSpecification;
                const overlapCaptions = action.payload.overlapEnabled;

                const previousPreviousCue = state[index - 2];
                const previousCue = state[index - 1];
                const currentCue = state[index];
                const followingCue = state[index + 1];
                const followingFollowingCue = state[index + 2];
                if (previousCue) {
                    previousCue.corrupted = !conformToRules(
                        previousCue, subtitleSpecification, previousPreviousCue, currentCue, overlapCaptions
                    );
                }
                currentCue.corrupted =
                    !conformToRules(
                        currentCue, subtitleSpecification, previousCue, followingCue, overlapCaptions
                    );
                if (followingCue) {
                    followingCue.corrupted = !conformToRules(
                        followingCue, subtitleSpecification, currentCue, followingFollowingCue, overlapCaptions
                    );
                }
            }
        },
        syncCues: (state, action: PayloadAction<CuesAction>): CueDto[] => {
            const sourceCues = action.payload.cues;
            return state.map((cue: CueDto, index: number) => {
                const vttCue = cue.vttCue;
                const startTime = sourceCues[index].vttCue.startTime;
                const endTime = sourceCues[index].vttCue.endTime;
                const newCue = new VTTCue(startTime, endTime, vttCue.text);
                copyNonConstructorProperties(newCue, vttCue);
                return ({ ...cue, vttCue: newCue } as CueDto);
            });
        }
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CueDto[] => [],
        [subtitleSpecificationSlice.actions.readSubtitleSpecification.type]:
            (state, action: PayloadAction<CheckOptions>): CueDto[] =>
                markCues(state, action.payload.subtitleSpecification, action.payload.overlapEnabled),
    }
});

export const lastCueChangeSlice = createSlice({
    name: "lastCueChange",
    initialState: null as CueChange | null,
    reducers: {
        recordCueChange: (_state, action: PayloadAction<CueChange>): CueChange => action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CueChange | null => null
    }
});