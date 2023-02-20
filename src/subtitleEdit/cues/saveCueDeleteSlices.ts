import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dispatch } from "react";
import {CueDto, DeleteTrackCueId, SubtitleEditAction} from "../model";
import { debounce } from "lodash";

const DEBOUNCE_TIMEOUT = 2500;

export interface SaveCueDelete {
    deleteCue: ((trackCues: DeleteTrackCueId) => Promise<string>) | null;
    cueDeleteIds: Set<string>;
}

const initSaveCueDelete = {
    deleteCue: null,
    cueDeleteIds: new Set()
} as SaveCueDelete;

export const saveCueDeleteSlice = createSlice({
    name: "saveCueDelete",
    initialState: initSaveCueDelete,
    reducers: {
        setDeleteCueCallback: (state, action: PayloadAction<(trackCue: DeleteTrackCueId) => Promise<string>>): void => {
            state.deleteCue = action.payload;
        },
        addCueIdForDelete: (state, action: PayloadAction<string>): void => {
            state.cueDeleteIds.add(action.payload);
        },
        clearCueIdsForDelete: (state): void => {
            state.cueDeleteIds.clear();
        }
    }
});

const executeCueDeleteCallback = (
    getState: Function,
    cueIdsToDelete: string[]
): void => {
    const deleteCueCallback = getState().saveCueDelete.deleteCue;
    for (const cueId of cueIdsToDelete) {
        const editingTrack = getState().editingTrack;
        deleteCueCallback({ editingTrack, cueId });
    }
};

const saveCueDeleteRequest = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function
): void => {
    const cueIdsToDelete = [ ...getState().saveCueDelete.cueDeleteIds ];
    dispatch(saveCueDeleteSlice.actions.clearCueIdsForDelete());
    if (cueIdsToDelete.length === 0) {
        return;
    }
    executeCueDeleteCallback(getState, cueIdsToDelete);
};

const saveCueDeleteDebounced = debounce(saveCueDeleteRequest, DEBOUNCE_TIMEOUT, { leading: false, trailing: true });

export const callSaveCueDelete = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function,
    cueToDelete: CueDto
): void => {
    if (!cueToDelete.id) {
        return;
    }
    dispatch(saveCueDeleteSlice.actions.addCueIdForDelete(cueToDelete.id));
    saveCueDeleteDebounced(dispatch, getState);
};
