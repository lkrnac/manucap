import { Dispatch } from "react";
import { PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

import { CueCategory, CueDto, ScrollPosition, SubtitleEditAction, Track } from "../model";
import { AppThunk, SubtitleEditState } from "../subtitleEditReducers";
import { constructCueValuesArray, copyNonConstructorProperties } from "./cueUtils";
import { Constants } from "../constants";
import {
    applyInvalidRangePreventionEnd,
    applyInvalidRangePreventionStart,
    applyLineLimitation,
    applyOverlapPreventionEnd,
    applyOverlapPreventionStart,
    conformToRules,
    getTimeGapLimits,
    verifyCueDuration
} from "./cueVerifications";
import { scrollPositionSlice } from "./cuesListScrollSlice";
import { fetchSpellCheck } from "./spellCheck/spellCheckFetch";
import { lastCueChangeSlice, updateSearchMatches, validationErrorSlice } from "./edit/cueEditorSlices";
import { CueCorruptedSetAction, cuesSlice, SpellCheckRemovalAction } from "./cuesListSlices";
import { callSaveTrack } from "./saveSlices";

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


const callFetchSpellCheck = (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>,
                             getState: Function, customIndex?: number): void => {
    const track = getState().editingTrack as Track;
    const index = customIndex != null ? customIndex : getState().editingCueIndex as number;
    console.log("Running for cue index " + index);
    const currentEditingCue = getState().cues[index];
    if (currentEditingCue) {
        const text = currentEditingCue.vttCue.text as string;
        const editUuid = currentEditingCue.editUuid as string;
        const spellCheckerSettings = getState().spellCheckerSettings;
        console.log("required > ");
        console.log(editUuid);
        console.log(track);
        console.log(spellCheckerSettings.enabled);
        console.log("//////////");
        if (track && spellCheckerSettings.enabled) {
            fetchSpellCheck(dispatch, getState, index, text,
                spellCheckerSettings, track.language?.id, track.id);
        }
    }
};

export const applySpellchecker = (customIndex?: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState: Function): void => {
        callFetchSpellCheck(dispatch, getState, customIndex);
    };

export const checkErrors = (index: number, overlapEnabled?: boolean, fetchSpellcheck?: boolean): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        if (index !== undefined) {
            console.log("checkErrors " + fetchSpellcheck);

            const subtitleSpecification = getState().subtitleSpecifications;
            const cues = getState().cues;
            const previousPreviousCue = cues[index - 2];
            const previousCue = cues[index - 1];
            const currentCue = cues[index];
            const followingCue = cues[index + 1];
            const followingFollowingCue = cues[index + 2];
            if (previousCue) {
                const periviousCorrupted = !conformToRules(
                    dispatch, index - 1,
                    previousCue, subtitleSpecification, previousPreviousCue, currentCue,
                    overlapEnabled, fetchSpellcheck

                );
                dispatch(
                    cuesSlice.actions.setCorrupted(
                        { index : index-1 , corrupted : periviousCorrupted } as CueCorruptedSetAction));

            }

            const currentCorrupted = !conformToRules(
                dispatch, index,
                currentCue, subtitleSpecification, previousCue, followingCue,
                overlapEnabled,fetchSpellcheck
            );
            dispatch(cuesSlice.actions.setCorrupted(
                { index : index , corrupted : currentCorrupted } as CueCorruptedSetAction));

            if (followingCue) {
                const followingCorrupted = !conformToRules(
                    dispatch, index + 1,
                    followingCue, subtitleSpecification, currentCue, followingFollowingCue,
                    overlapEnabled, fetchSpellcheck
                );
                dispatch(cuesSlice.actions.setCorrupted(
                    { index : index + 1 , corrupted : followingCorrupted } as CueCorruptedSetAction));

            }
        }
    };


export const updateVttCue = (idx: number, vttCue: VTTCue, editUuid?: string, textOnly?: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState): void => {
        console.log("update vtt cue ?");
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
            const track = getState().editingTrack as Track;
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

            const newCue = { ...originalCue, idx, vttCue: newVttCue };
            dispatch(cuesSlice.actions.updateVttCue(newCue));
            dispatch(lastCueChangeSlice.actions.recordCueChange({ changeType: "EDIT", index: idx, vttCue: newVttCue }));
            updateSearchMatches(dispatch, getState, idx);
            console.log("update vtt cue call checkerrors");
            // @ts-ignore
            dispatch(checkErrors(idx, overlapCaptionsAllowed));
            callSaveTrack(dispatch, getState);
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
            const overlapCaptionsAllowed = track?.overlapEnabled;
            console.log("validateCorruptedCues call checkerrors");

            // @ts-ignore
            dispatch(checkErrors(cues.indexOf(cue), overlapCaptionsAllowed));
        });
    };

export const updateCueCategory = (idx: number, cueCategory: CueCategory): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState): void => {
        dispatch(cuesSlice.actions.updateCueCategory({ idx, cueCategory }));
        callSaveTrack(dispatch, getState);
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
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState): void => {
        dispatch(cuesSlice.actions.deleteCue({ idx }));
        dispatch(lastCueChangeSlice.actions
            .recordCueChange({ changeType: "REMOVE", index: idx, vttCue: new VTTCue(0, 0, "") }));
        callSaveTrack(dispatch, getState);
    };

export const updateCues = (cues: CueDto[]): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CuesAction>>): void => {
        dispatch(cuesSlice.actions.updateCues({ cues }));
    };

export const applyShiftTime = (shiftTime: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState): void => {
        dispatch(cuesSlice.actions.applyShiftTime(shiftTime));
        callSaveTrack(dispatch, getState);
    };

export const syncCues = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState): void => {
        const cues = getState().sourceCues;
        if (cues && cues.length > 0) {
            dispatch(cuesSlice.actions.syncCues({ cues }));
            callSaveTrack(dispatch, getState);
        }
    };
