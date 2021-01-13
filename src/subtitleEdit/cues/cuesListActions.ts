import { Dispatch } from "react";
import { createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
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
    getTimeGapLimits, markCues,
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


export const applySpellchecker = createAsyncThunk(
    "spellchecker/applySpellchecker",
    async (index: number, thunkAPI) => {
        const state: SubtitleEditState = thunkAPI.getState() as SubtitleEditState;
        const track = state.editingTrack as Track;
        const currentEditingCue = state.cues[index];
        if (currentEditingCue) {
            const text = currentEditingCue.vttCue.text as string;
            const editUuid = currentEditingCue.editUuid as string;
            const spellCheckerSettings = state.spellCheckerSettings;
            if (editUuid && track && track.language?.id && spellCheckerSettings.enabled) {
                fetchSpellCheck(thunkAPI.dispatch, index, text, spellCheckerSettings, track.language.id, track.id);
            }
        }
    }
);

export const checkErrors = (index: number, alwaysCallSpellcheck?: boolean): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        if (index !== undefined) {
            const subtitleSpecification = getState().subtitleSpecifications;
            const overlapEnabled = getState().editingTrack?.overlapEnabled;
            const cues = getState().cues;
            const previousCue = cues[index - 1];
            const currentCue = cues[index];
            const followingCue = cues[index + 1];
            if (currentCue != null) {
                if (alwaysCallSpellcheck || !currentCue.spellCheck) {
                    dispatch(applySpellchecker(index));
                }
                const currentCorrupted = !conformToRules(
                    currentCue, subtitleSpecification, previousCue, followingCue,
                    overlapEnabled
                );
                dispatch(cuesSlice.actions.setCorrupted(
                    { index: index, corrupted: currentCorrupted } as CueCorruptedSetAction));
            }
        }
    };

const validateCue = (dispatch: Dispatch<SubtitleEditAction | void>,
                     index: number): void => {
    dispatch(checkErrors(index - 1));
    dispatch(checkErrors(index, true));
    dispatch(checkErrors(index + 1));
};

export const updateVttCue = (idx: number, vttCue: VTTCue, editUuid?: string, textOnly?: boolean): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void | null>, getState): void => {
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
            validateCue(dispatch, idx);
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

export const validateCorruptedCues = (matchText: string): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void | null>, getState): void => {
        const cues = getState().cues;
        cues.filter(cue => cue.corrupted
            && cue.vttCue.text.includes(matchText)).forEach((cue: CueDto) => {
            dispatch(checkErrors(cues.indexOf(cue)));
        });
    };

export const updateCueCategory = (idx: number, cueCategory: CueCategory): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>, getState): void => {
        dispatch(cuesSlice.actions.updateCueCategory({ idx, cueCategory }));
        callSaveTrack(dispatch, getState);
    };

export const addCue = (idx: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | null>>, getState): void => {
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
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | void | null>>, getState): void => {
        dispatch(cuesSlice.actions.deleteCue({ idx }));
        dispatch(lastCueChangeSlice.actions
            .recordCueChange({ changeType: "REMOVE", index: idx, vttCue: new VTTCue(0, 0, "") }));
        callSaveTrack(dispatch, getState);
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
