import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { debounce } from "lodash";
import { Dispatch } from "react";
import { CueDto, SubtitleEditAction, TrackCue } from "../model";
import { checkSaveStateAndSave, saveActionSlice, SaveState, setAutoSaveSuccess } from "./saveSlices";
import { AppThunk } from "../subtitleEditReducers";
import { cuesSlice } from "./cuesList/cuesListSlices";
import { editingTrackSlice } from "../trackSlices";
import { AnyAction } from "redux";

const DEBOUNCE_TIMEOUT = 2500;

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
        addCueIdsForUpdate: (state, action: PayloadAction<string | undefined>): void => {
            if (action.payload) {
                state.cueUpdateIds.add(action.payload);
            }
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

const executeCueUpdateCallback = async (
    dispatch: Dispatch<AppThunk | PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function,
    cueIdsToUpdate: string[]
): Promise<boolean> => {
    const updateCueCallback = getState().saveCueUpdate.updateCue;
    let updateCueError = false;
    for (const cueId of cueIdsToUpdate) {
        const cueToUpdate = getState().cues.find((aCue: CueDto) => aCue.id === cueId || aCue.addId === cueId);
        if (cueToUpdate) {
            try {
                const editingTrack = getState().editingTrack;
                await updateCueCallback({ editingTrack, cue: cueToUpdate })
                    .then((responseCueDto: CueDto) => {
                        updateAddedCueIdIfNeeded(dispatch, getState, cueToUpdate.addId, responseCueDto);
                        const lockingVersion = responseCueDto.trackVersionLockingVersion;
                        if (lockingVersion) {
                            dispatch(editingTrackSlice.actions.updateEditingTrackLockingVersion(lockingVersion));
                        }
                        return responseCueDto;
                    });
            } catch (e) {
                updateCueError = true;
            }
        }
    }
    return updateCueError;
};

const saveCueUpdateRequest = (
    dispatch: Dispatch<AppThunk | PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function
): void => {
    const cueIdsToUpdate: string[] = [ ...getState().saveCueUpdate.cueUpdateIds ];
    dispatch(saveCueUpdateSlice.actions.clearCueUpdateIds());
    if (cueIdsToUpdate.length === 0) {
        return;
    }
    dispatch(saveActionSlice.actions.setState(
        { saveState: SaveState.REQUEST_SENT, multiCuesEdit: false }
    ));
    executeCueUpdateCallback(dispatch, getState, cueIdsToUpdate)
        .then((updateCueError) => {
            dispatch(setAutoSaveSuccess(!updateCueError));
        });
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

export const callSaveCueUpdate = (cueIndex: number): AppThunk =>
    (dispatch: Dispatch<AnyAction | PayloadAction<SubtitleEditAction | undefined> | void>, getState): void => {
    const cue = getState().cues[cueIndex];
    if (cue) {
        const cueId = cue.addId ? cue.addId : cue.id;
        dispatch(saveCueUpdateSlice.actions.addCueIdsForUpdate(cueId));
        checkSaveStateAndSave(dispatch, getState, saveCueUpdateDebounced, false);
    }
};

export const retrySaveCueUpdateIfNeeded = (
    dispatch: Dispatch<AppThunk | PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function
): void => {
    if (getState().saveCueUpdate.cueUpdateIds.size > 0) {
        saveCueUpdateRequest(dispatch, getState);
    }
};
