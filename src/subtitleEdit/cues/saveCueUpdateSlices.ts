import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { debounce } from "lodash";
import { Dispatch } from "react";
import { CueDto, SubtitleEditAction, TrackCue } from "../model";
import { checkSaveStateAndSave, saveActionSlice, SaveState, setAutoSaveSuccess } from "./saveSlices";
import { AppThunk } from "../subtitleEditReducers";
import { cuesSlice } from "./cuesList/cuesListSlices";

const DEBOUNCE_TIMEOUT = 2500;

const isRejected = (input: PromiseSettledResult<unknown>): input is PromiseRejectedResult =>
    input.status === "rejected";

export interface SaveCueUpdateCallback {
    updateCue: ((trackCue: TrackCue) => Promise<CueDto>) | null;
    cueUpdateIds: Set<string>;
}

const initSaveCueCallbacks = {
    updateCue: null,
    cueUpdateIds: new Set()
} as SaveCueUpdateCallback;

export const saveCueUpdateSlice = createSlice({
    name: "saveCueUpdate",
    initialState: initSaveCueCallbacks,
    reducers: {
        setUpdateCueCallback: (state, action: PayloadAction<(trackCue: TrackCue) => Promise<CueDto>>): void => {
            state.updateCue = action.payload;
        },
        addCueIdsForUpdate: (state, action: PayloadAction<string>): void => {
            state.cueUpdateIds.add(action.payload);
        },
        clearCueUpdateIds: (state): void => {
            state.cueUpdateIds.clear();
        }
    }
});

const updateAddedCueIdIfNeeded = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction | AppThunk | undefined>>,
    getState: Function,
    cueAddId: string,
    cue: CueDto
): void => {
    if (cueAddId) {
        const foundCueIndex = getState().cues.findIndex((aCue: CueDto) => aCue.addId === cueAddId);
        if (foundCueIndex !== -1) {
            dispatch(cuesSlice.actions.updateAddedCue({ idx: foundCueIndex, cue }));
        }
    }
};

export const updateSaveActionStateIfNeeded = (
    dispatch: Dispatch<AppThunk | PayloadAction<SubtitleEditAction | undefined>>,
    cuesSavedPromises: Promise<CueDto | string>[]
): void => {
    if (cuesSavedPromises.length > 0) {
        dispatch(saveActionSlice.actions.setState(
            { saveState: SaveState.REQUEST_SENT, multiCuesEdit: false }
        ));
        Promise.allSettled(cuesSavedPromises).
        then((results) => {
                const rejected = results.some((result) => isRejected(result));
                dispatch(setAutoSaveSuccess(!rejected));
            }
        );
    }
};

const saveCueUpdateRequest = (
    dispatch: Dispatch<AppThunk | PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function
): void => {
    const updateCueCallback = getState().saveCueUpdate.updateCue;
    const cuesToUpdatePromises: Promise<CueDto>[] = [];
    const editingTrack = getState().editingTrack;
    const cueIdsToUpdate: string[] = [ ...getState().saveCueUpdate.cueUpdateIds ];
    dispatch(saveCueUpdateSlice.actions.clearCueUpdateIds());
    cueIdsToUpdate.forEach((cueId: string) => {
        const cueToUpdate = getState().cues.find((aCue: CueDto) => aCue.id === cueId || aCue.addId === cueId);
        if (cueToUpdate) {
            const updatePromise = updateCueCallback({ editingTrack, cue: cueToUpdate })
                .then((responseCueDto: CueDto) => {
                    updateAddedCueIdIfNeeded(dispatch, getState, cueToUpdate.addId, responseCueDto);
                    return responseCueDto;
                });
            cuesToUpdatePromises.push(updatePromise);
        }
    });
    updateSaveActionStateIfNeeded(dispatch, cuesToUpdatePromises);
};

const saveCueUpdateCurrent = (
    dispatch: Dispatch<AppThunk | PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function
): void => {
    const saveAction = getState().saveAction;
    if (saveAction.saveState === SaveState.TRIGGERED) {
        saveCueUpdateRequest(dispatch, getState);
    }
};

const saveCueUpdateDebounced = debounce(saveCueUpdateCurrent, DEBOUNCE_TIMEOUT, { leading: false, trailing: true });

export const callSaveCueUpdate = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    getState: Function,
    cueIndex: number
): void => {
    const cue = getState().cues[cueIndex];
    const cueId = cue.addId ? cue.addId : cue.id;
    dispatch(saveCueUpdateSlice.actions.addCueIdsForUpdate(cueId));
    checkSaveStateAndSave(dispatch, getState, saveCueUpdateDebounced, false);
};

export const retrySaveCueUpdateIfNeeded = (
    dispatch: Dispatch<AppThunk | PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function
): void => {
    if (getState().saveCueUpdate.cueUpdateIds.size > 0) {
        saveCueUpdateRequest(dispatch, getState);
    }
};
