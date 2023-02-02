import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { debounce } from "lodash";
import { Dispatch } from "react";
import { CueDto, TrackCues } from "../model";
import { SaveAction, saveActionSlice, SaveState } from "./saveSlices";

const DEBOUNCE_TIMEOUT = 2500;
export interface SaveCueUpdateCallback {
    updateCue: ((trackCues: TrackCues) => void) | null;
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
        setUpdateCueCallback: (state, action: PayloadAction<(trackCues: TrackCues) => void>): void => {
            state.updateCue = action.payload;
        },
        callUpdateCueCallback: (state, action: PayloadAction<TrackCues>): void => {
            if (state.updateCue) {
                state.updateCue(action.payload);
            }
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
    dispatch: Dispatch<PayloadAction<TrackCues | SaveAction | undefined>>,
    getState: Function
): void => {
    const editingTrack = getState().editingTrack;
    const cuesToUpdate: CueDto[] = [];
    // TODO: maybe instead of indexes, store cue IDs
    getState().saveCueUpdates.cueUpdateIndexes
        .forEach((index: number) => {
            const cueToUpdate = getState().cues[index];
            cuesToUpdate.push(cueToUpdate);
        });
    dispatch(saveCueUpdateSlice.actions.clearCueUpdateIndexes());
    dispatch(saveCueUpdateSlice.actions.callUpdateCueCallback({ editingTrack, cues: cuesToUpdate }));
    dispatch(saveActionSlice.actions.setState(
        { saveState: SaveState.REQUEST_SENT, multiCuesEdit: false }
    ));
};

const saveCueUpdateCurrent = (
    dispatch: Dispatch<PayloadAction<TrackCues | SaveAction | number | undefined>>,
    getState: Function
): void => {
    const saveAction = getState().saveAction;
    if (saveAction.saveState === SaveState.TRIGGERED) {
        saveCueUpdateRequest(dispatch, getState);
    }
};

const saveCueUpdateDebounced = debounce(saveCueUpdateCurrent, DEBOUNCE_TIMEOUT, { leading: false, trailing: true });

export const callSaveCueUpdate = (
    dispatch: Dispatch<PayloadAction<TrackCues | SaveAction | number | undefined>>,
    getState: Function,
    cueIndex: number
): void => {
    dispatch(saveCueUpdateSlice.actions.addCueIndexForUpdate(cueIndex));
    const saveAction = getState().saveAction;
    if (saveAction.saveState === SaveState.REQUEST_SENT || saveAction.saveState === SaveState.RETRY) {
        dispatch(saveActionSlice.actions.setState(
            { saveState: SaveState.RETRY, multiCuesEdit: saveAction.multiCuesEdit }
        ));
    } else {
        dispatch(saveActionSlice.actions.setState(
            { saveState: SaveState.TRIGGERED, multiCuesEdit: false }
        ));
        saveCueUpdateDebounced(dispatch, getState);
    }
};

export const retrySaveCueUpdateIfNeeded = (
    dispatch: Dispatch<PayloadAction<TrackCues | SaveAction | undefined>>,
    getState: Function
): void => {
    if (!getState().saveCueUpdates.cueUpdateIndexes.isEmpty()) {
        saveCueUpdateRequest(dispatch, getState);
    }
};
