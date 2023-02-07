import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dispatch } from "react";
import { CueDto, SubtitleEditAction, Track } from "../model";
import { checkSaveStateAndSave, SaveState } from "./saveSlices";
import { debounce } from "lodash";
import { updateSaveActionStateIfNeeded } from "./saveCueUpdateSlices";
import { AppThunk } from "../subtitleEditReducers";

const DEBOUNCE_TIMEOUT = 2500;

export interface DeleteTrackCueId {
    editingTrack: Track;
    cueId: string;
}

export interface SaveCueDelete {
    deleteCue: ((trackCues: DeleteTrackCueId) => Promise<string>) | null;
    cueDeleteIds: Set<string>;
}

const initSaveCueDelete = {
    deleteCue: null,
    cueDeleteIds: new Set()
} as SaveCueDelete;

export const saveCueDeleteSlice = createSlice({
    name: "saveCueDeletes",
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

const saveCueDeleteRequest = (
    dispatch: Dispatch<AppThunk | PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function
): void => {
    const deleteCueCallback = getState().saveCueDeletes.deleteCue;
    const cuesToDeletePromises: Promise<CueDto>[] = [];
    const editingTrack = getState().editingTrack;
    const cueIdsToDelete = [ ...getState().saveCueDeletes.cueDeleteIds ];
    dispatch(saveCueDeleteSlice.actions.clearCueIdsForDelete());
    cueIdsToDelete.forEach((cueId: string) => {
        const deletePromise = deleteCueCallback({ editingTrack, cueId });
        cuesToDeletePromises.push(deletePromise);
    });
    updateSaveActionStateIfNeeded(dispatch, cuesToDeletePromises);
};

const saveCueDeleteCurrent = (
    dispatch: Dispatch<AppThunk | PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function
): void => {
    const saveAction = getState().saveAction;
    if (saveAction.saveState === SaveState.TRIGGERED) {
        saveCueDeleteRequest(dispatch, getState);
    }
};

const saveCueDeleteDebounced = debounce(saveCueDeleteCurrent, DEBOUNCE_TIMEOUT, { leading: false, trailing: true });

export const callSaveCueDelete = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function,
    cueToDelete: CueDto
): void => {
    if (!cueToDelete.id) {
        return;
    }
    dispatch(saveCueDeleteSlice.actions.addCueIdForDelete(cueToDelete.id));
    checkSaveStateAndSave(dispatch, getState, saveCueDeleteDebounced, false);
};

export const retrySaveCueDeleteIfNeeded = (
    dispatch: Dispatch<AppThunk | PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function
): void => {
    if (getState().saveCueDeletes.cueDeleteIds.size > 0) {
        saveCueDeleteRequest(dispatch, getState);
    }
};
