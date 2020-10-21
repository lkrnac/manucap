import { Dispatch } from "react";
import { PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

import { CueCategory, CueDto, ScrollPosition, SubtitleEditAction } from "../model";
import { AppThunk, SubtitleEditState } from "../subtitleEditReducers";
import {
    constructCueValuesArray,
    copyNonConstructorProperties
} from "./cueUtils";
import { Constants } from "../constants";
import {
    applyInvalidRangePreventionEnd,
    applyInvalidRangePreventionStart,
    applyLineLimitation,
    applyOverlapPreventionEnd,
    applyOverlapPreventionStart,
    getTimeGapLimits,
    markCues,
    verifyCueDuration
} from "./cueVerifications";
import { scrollPositionSlice } from "./cuesListScrollSlice";
import { fetchSpellCheck } from "./spellCheck/spellCheckFetch";
import { SearchDirection } from "./searchReplace/model";
import { searchCueText } from "./searchReplace/searchUtils";
import { validationErrorSlice } from "./edit/cueEditorSlices";
import { cuesSlice, lastCueChangeSlice, SpellCheckRemovalAction } from "./cuesListSlices";

export interface CueIndexAction extends SubtitleEditAction {
    idx: number;
}

export interface CueCategoryAction extends CueIndexAction {
    cueCategory: CueCategory;
}

interface CuesAction extends SubtitleEditAction {
    cues: CueDto[];
}

const shouldBlink = (x: VTTCue, y: VTTCue, textOnly?: boolean): boolean => {
    return textOnly ?
        x.text !== y.text :
        JSON.stringify(constructCueValuesArray(x)) !== JSON.stringify(constructCueValuesArray(y));
};

const createAndAddCue = (previousCue: CueDto,
                         maxGapLimit: number,
                         sourceCue?: CueDto): CueDto => {
    const startTime = sourceCue
        ? sourceCue.vttCue.startTime
        : previousCue.vttCue.endTime;
    const endTime = sourceCue
        ? sourceCue.vttCue.endTime
        : previousCue.vttCue.endTime + maxGapLimit;
    const newCue = new VTTCue(startTime, endTime, "");
    copyNonConstructorProperties(newCue, previousCue.vttCue);
    return { vttCue: newCue, cueCategory: previousCue.cueCategory, editUuid: uuidv4() };
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

export const updateVttCue = (idx: number, vttCue: VTTCue, editUuid?: string, textOnly?: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState): void => {
        const cues = getState().cues;
        const originalCue = cues[idx];
        if (originalCue && editUuid === originalCue.editUuid) { // cue wasn't removed in the meantime from cues list
            let newVttCue = new VTTCue(vttCue.startTime, vttCue.endTime, vttCue.text);
            if (textOnly) {
                newVttCue = new VTTCue(originalCue.vttCue.startTime, originalCue.vttCue.endTime, vttCue.text);
                copyNonConstructorProperties(newVttCue, originalCue.vttCue);
            } else {
                copyNonConstructorProperties(newVttCue, vttCue);
            }

            const previousCue = cues[idx - 1];
            const followingCue = cues[idx + 1];
            const subtitleSpecifications = getState().subtitleSpecifications;
            const track = getState().editingTrack;
            const overlapCaptionsAllowed = track?.overlapEnabled;

            if (vttCue.startTime !== originalCue.vttCue.startTime) {
                overlapCaptionsAllowed || applyOverlapPreventionStart(newVttCue, previousCue);
                applyInvalidRangePreventionStart(newVttCue, subtitleSpecifications);
            }
            if (vttCue.endTime !== originalCue.vttCue.endTime) {
                overlapCaptionsAllowed || applyOverlapPreventionEnd(newVttCue, followingCue);
                applyInvalidRangePreventionEnd(newVttCue, subtitleSpecifications);
            }
            applyLineLimitation(newVttCue, originalCue, subtitleSpecifications);

            if (shouldBlink(vttCue, newVttCue, textOnly)) {
                dispatch(validationErrorSlice.actions.setValidationError(true));
            }

            dispatch(cuesSlice.actions.updateVttCue({ idx, vttCue: newVttCue, editUuid }));
            dispatch(lastCueChangeSlice.actions.recordCueChange({ changeType: "EDIT", index: idx, vttCue: newVttCue }));

            const language = track?.language?.id;
            const spellCheckerSettings = getState().spellCheckerSettings;
            if (language && spellCheckerSettings.enabled) {
                const trackId = track?.id;
                if (trackId && editUuid) {
                    fetchSpellCheck(dispatch, getState, trackId, idx, newVttCue.text,
                        spellCheckerSettings, language);
                }
            }
            const searchReplace = getState().searchReplace;
            const offsets = searchCueText(newVttCue.text, searchReplace.find, searchReplace.matchCase);
            const offsetIndex = finNextOffsetIndexForSearch(originalCue, offsets, searchReplace.direction);
            dispatch(cuesSlice.actions.addSearchMatches(
                { idx, searchMatches: { offsets, matchLength: searchReplace.find.length, offsetIndex }}
                )
            );
            dispatch(cuesSlice.actions.checkErrors({
                subtitleSpecification: subtitleSpecifications,
                overlapEnabled: overlapCaptionsAllowed,
                index: idx
            }));
        }
    };

export const removeIgnoredSpellcheckedMatchesFromAllCues = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        const trackId = getState().editingTrack?.id;
        if (trackId) {
            dispatch(cuesSlice.actions
                .removeIgnoredSpellcheckedMatchesFromAllCues({ trackId: trackId } as SpellCheckRemovalAction));
        }
    };

export const validateCorruptedCues = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        const cues = getState().cues;
        cues.filter(cue => cue.corrupted).forEach((cue: CueDto) => {
            const track = getState().editingTrack;
            const subtitleSpecifications = getState().subtitleSpecifications;
            const overlapCaptionsAllowed = track?.overlapEnabled;
            dispatch(cuesSlice.actions.checkErrors({
                subtitleSpecification: subtitleSpecifications,
                overlapEnabled: overlapCaptionsAllowed,
                index: cues.indexOf(cue)
            }));
        });
    };

export const updateCueCategory = (idx: number, cueCategory: CueCategory): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueCategoryAction>>): void => {
        dispatch(cuesSlice.actions.updateCueCategory({ idx, cueCategory }));
    };

export const addCue = (idx: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        const state: SubtitleEditState = getState();
        const subtitleSpecifications = state.subtitleSpecifications;
        const timeGapLimit = getTimeGapLimits(subtitleSpecifications);
        const step = Math.min(timeGapLimit.maxGap, Constants.NEW_ADDED_CUE_DEFAULT_STEP);
        const cues = state.cues;
        const previousCue = cues[idx - 1] || Constants.DEFAULT_CUE;
        const sourceCue = state.sourceCues[idx];
        const cue = createAndAddCue(previousCue, step, sourceCue);
        const overlapCaptionsAllowed = getState().editingTrack?.overlapEnabled;

        if (!overlapCaptionsAllowed) {
            const followingCue = cues[idx];
            applyOverlapPreventionStart(cue.vttCue, previousCue);
            applyOverlapPreventionEnd(cue.vttCue, followingCue);
        }
        const validCueDuration = verifyCueDuration(cue.vttCue, timeGapLimit);

        if (validCueDuration) {
            dispatch(cuesSlice.actions.addCue({ idx, cue }));
            dispatch(lastCueChangeSlice.actions.recordCueChange({ changeType: "ADD", index: idx, vttCue: cue.vttCue }));
            dispatch(scrollPositionSlice.actions.changeScrollPosition(ScrollPosition.CURRENT));
        } else {
            dispatch(validationErrorSlice.actions.setValidationError(true));
        }
    };

export const deleteCue = (idx: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(cuesSlice.actions.deleteCue({ idx }));
        dispatch(lastCueChangeSlice.actions
            .recordCueChange({ changeType: "REMOVE", index: idx, vttCue: new VTTCue(0, 0, "") }));
    };

export const updateCues = (cues: CueDto[]): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CuesAction>>, getState): void => {
        const checkedCues = markCues(
            cues,
            getState().subtitleSpecifications,
            getState().editingTrack?.overlapEnabled
        );
        dispatch(cuesSlice.actions.updateCues({ cues: checkedCues }));
    };

export const applyShiftTime = (shiftTime: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<number>>): void => {
        dispatch(cuesSlice.actions.applyShiftTime(shiftTime));
    };

export const syncCues = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CuesAction>>, getState): void => {
        const cues = getState().sourceCues;
        if (cues && cues.length > 0) {
            dispatch(cuesSlice.actions.syncCues({ cues }));
        }
    };
