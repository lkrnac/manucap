import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dispatch } from "react";
import { CueDto, SubtitleEditAction, Track } from "../model";
import { checkSaveStateAndSave, saveActionSlice, SaveState, setAutoSaveSuccess } from "./saveSlices";
import { debounce } from "lodash";
import { AppThunk } from "../subtitleEditReducers";
import { editingTrackSlice } from "../trackSlices";

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

const executeCueDeleteCallback = async (
    dispatch: Dispatch<AppThunk | PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function,
    cueIdsToDelete: string[]
): Promise<boolean> => {
    const deleteCueCallback = getState().saveCueDelete.deleteCue;
    let deleteCueError = false;
    for (const cueId of cueIdsToDelete) {
        try {
            const editingTrack = getState().editingTrack;
            await deleteCueCallback({ editingTrack, cueId })
                .then(() => {
                    const lockingVersion = editingTrack.lockingVersion;
                    if (lockingVersion) {
                        dispatch(editingTrackSlice.actions.updateEditingTrackLockingVersion(lockingVersion + 1));
                    }
                });
        } catch (e) {
            deleteCueError = true;
        }
    }
    return deleteCueError;
};

const saveCueDeleteRequest = (
    dispatch: Dispatch<AppThunk | PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function
): void => {
    const cueIdsToDelete = [ ...getState().saveCueDelete.cueDeleteIds ];
    dispatch(saveCueDeleteSlice.actions.clearCueIdsForDelete());
    if (cueIdsToDelete.length === 0) {
        return;
    }
    dispatch(saveActionSlice.actions.setState(
        { saveState: SaveState.REQUEST_SENT, multiCuesEdit: false }
    ));
    executeCueDeleteCallback(dispatch, getState, cueIdsToDelete)
        .then((deleteCueError) => {
            dispatch(setAutoSaveSuccess(!deleteCueError));
        });
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
    if (getState().saveCueDelete.cueDeleteIds.size > 0) {
        saveCueDeleteRequest(dispatch, getState);
    }
};
