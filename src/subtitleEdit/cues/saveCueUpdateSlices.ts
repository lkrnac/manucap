import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { debounce } from "lodash";
import { Dispatch } from "react";
import { CueDto, SubtitleEditAction, TrackCue } from "../model";
import { checkSaveStateAndSave, saveActionSlice, SaveState, setAutoSaveSuccess } from "./saveSlices";
import { AppThunk } from "../subtitleEditReducers";

const DEBOUNCE_TIMEOUT = 2500;
export interface SaveCueUpdateCallback {
    updateCue: ((trackCue: TrackCue) => Promise<CueDto>) | null;
    cueUpdateIndexes: Set<number>;
}

const initSaveCueCallbacks = {
    updateCue: null,
    cueUpdateIndexes: new Set()
} as SaveCueUpdateCallback;

export const saveCueUpdateSlice = createSlice({
    name: "callSaveCueUpdate",
    initialState: initSaveCueCallbacks,
    reducers: {
        setUpdateCueCallback: (state, action: PayloadAction<(trackCue: TrackCue) => Promise<CueDto>>): void => {
            state.updateCue = action.payload;
        },
        addCueIndexForUpdate: (state, action: PayloadAction<number>): void => {
            state.cueUpdateIndexes.add(action.payload);
        },
        clearCueUpdateIndexes: (state): void => {
            state.cueUpdateIndexes.clear();
        }
    }
});

const saveCueUpdateRequest = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction | AppThunk | undefined>>,
    getState: Function
): void => {
    const updateCueCallback = getState().saveCueUpdates.updateCue;
    const cuesToUpdatePromises: Promise<CueDto>[] = [];
    const editingTrack = getState().editingTrack;
    const cueIndexesToUpdate: number[] = [ ...getState().saveCueUpdates.cueUpdateIndexes ];
    dispatch(saveCueUpdateSlice.actions.clearCueUpdateIndexes());
    cueIndexesToUpdate.forEach((index: number) => {
        const cueToUpdate = getState().cues[index];
        const updatePromise = updateCueCallback({ editingTrack, cue: cueToUpdate });
        cuesToUpdatePromises.push(updatePromise);
    });
    dispatch(saveActionSlice.actions.setState(
        { saveState: SaveState.REQUEST_SENT, multiCuesEdit: false }
    ));
    const isRejected = (input: PromiseSettledResult<unknown>): input is PromiseRejectedResult =>
        input.status === "rejected";
    Promise.allSettled(cuesToUpdatePromises).
        then((results) => {
            results.forEach((result) => {
                if (isRejected(result)) {
                    console.log("returned status: " + JSON.stringify(result.status));
                } else {
                    console.log("returned status: " + JSON.stringify(result.status));
                    console.log("returned cue dto: " + JSON.stringify(result.value));
                }
            });
            // TODO figure out TS error
            // @ts-ignore
            dispatch(setAutoSaveSuccess(true));
        }
    );

};

const saveCueUpdateCurrent = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction | undefined>>,
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
    dispatch(saveCueUpdateSlice.actions.addCueIndexForUpdate(cueIndex));
    checkSaveStateAndSave(dispatch, getState, saveCueUpdateDebounced, false);
};

export const retrySaveCueUpdateIfNeeded = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function
): void => {
    if (!getState().saveCueUpdates.cueUpdateIndexes.isEmpty()) {
        saveCueUpdateRequest(dispatch, getState);
    }
};
