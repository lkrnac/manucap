import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dispatch } from "react";
import { CueDto, Track } from "../model";
import { SaveAction, saveActionSlice, SaveState } from "./saveSlices";
import { debounce } from "lodash";

const DEBOUNCE_TIMEOUT = 2500;
export interface DeleteTrackCueIds {
    editingTrack: Track | null;
    cueIds: string[];
}

export interface SaveCueDelete {
    deleteCue: ((trackCues: DeleteTrackCueIds) => void) | null;
    cueDeleteIds: Set<string>;
}

const initSaveCueDelete = {
    deleteCue: null,
    cueDeleteIds: new Set()
} as SaveCueDelete;

export const saveCueDeleteSlice = createSlice({
    name: "callSaveCueDelete",
    initialState: initSaveCueDelete,
    reducers: {
        setDeleteCueCallback: (state, action: PayloadAction<(trackCue: DeleteTrackCueIds) => void>): void => {
            state.deleteCue = action.payload;
        },
        callDeleteCueCallback: (state, action: PayloadAction<DeleteTrackCueIds>): void => {
            if (state.deleteCue) {
                state.deleteCue(action.payload);
            }
        },
        addCueIdForDelete: (state, action: PayloadAction<string>): void => {
            state.cueDeleteIds.add(action.payload);
        },
        clearCueIdsForDelete: (state): void => {
            state.cueDeleteIds.clear();
        }
    }
});

const saveCueDeleteRequest = (
    dispatch: Dispatch<PayloadAction<DeleteTrackCueIds | SaveAction | undefined>>,
    getState: Function
): void => {
    const editingTrack = getState().editingTrack;
    const cueIdsToDelete = [ ...getState().saveCueDeletes.cueDeleteIds ];
    dispatch(saveCueDeleteSlice.actions.clearCueIdsForDelete());
    dispatch(saveCueDeleteSlice.actions.callDeleteCueCallback({ editingTrack, cueIds: cueIdsToDelete }));
    dispatch(saveActionSlice.actions.setState(
        { saveState: SaveState.REQUEST_SENT, multiCuesEdit: false }
    ));
};

const saveCueDeleteCurrent = (
    dispatch: Dispatch<PayloadAction<DeleteTrackCueIds | SaveAction | undefined>>,
    getState: Function
): void => {
    const saveAction = getState().saveAction;
    if (saveAction.saveState === SaveState.TRIGGERED) {
        saveCueDeleteRequest(dispatch, getState);
    }
};

const saveCueDeleteDebounced = debounce(saveCueDeleteCurrent, DEBOUNCE_TIMEOUT, { leading: false, trailing: true });

export const callSaveCueDelete = (
    dispatch: Dispatch<PayloadAction<DeleteTrackCueIds | SaveAction | string | undefined>>,
    getState: Function,
    cueToDelete: CueDto
): void => {
    if (!cueToDelete.id) {
        return;
    }
    dispatch(saveCueDeleteSlice.actions.addCueIdForDelete(cueToDelete.id));
    const saveAction = getState().saveAction;
    if (saveAction.saveState === SaveState.REQUEST_SENT || saveAction.saveState === SaveState.RETRY) {
        dispatch(saveActionSlice.actions.setState(
            { saveState: SaveState.RETRY, multiCuesEdit: saveAction.multiCuesEdit }
        ));
    } else {
        dispatch(saveActionSlice.actions.setState(
            { saveState: SaveState.TRIGGERED, multiCuesEdit: false }
        ));
        saveCueDeleteDebounced(dispatch, getState);
    }
};

export const retrySaveCueDeleteIfNeeded = (
    dispatch: Dispatch<PayloadAction<DeleteTrackCueIds | SaveAction | undefined>>,
    getState: Function
): void => {
    if (!getState().saveCueDeletes.cueDeleteIds.isEmpty()) {
        saveCueDeleteRequest(dispatch, getState);
    }
};
