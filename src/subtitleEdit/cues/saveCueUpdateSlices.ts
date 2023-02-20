import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { debounce } from "lodash";
import { Dispatch } from "react";
import { CueDto, SubtitleEditAction, SaveTrackCue } from "../model";
import { AppThunk } from "../subtitleEditReducers";
import { cuesSlice } from "./cuesList/cuesListSlices";

const DEBOUNCE_TIMEOUT = 2500;

export interface SaveCueUpdateCallback {
    updateCue: ((trackCue: SaveTrackCue) => Promise<CueDto>) | null;
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
        setUpdateCueCallback: (state, action: PayloadAction<(trackCue: SaveTrackCue) => Promise<CueDto>>): void => {
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

const executeCueUpdateCallback = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function,
    cueIdsToUpdate: string[]
): void => {
    const updateCueCallback = getState().saveCueUpdate.updateCue;
    for (const cueId of cueIdsToUpdate) {
        const cueToUpdate = getState().cues.find((aCue: CueDto) => aCue.id === cueId || aCue.addId === cueId);
        if (cueToUpdate) {
            const editingTrack = getState().editingTrack;
            const onSaveSuccess = (responseCueDto: CueDto) => {
                console.log("vtmssubtitle updateCueCallback addid: " + responseCueDto.addId);
                console.log("vtmssubtitle updateCueCallback id: " + responseCueDto.id);
                updateAddedCueIdIfNeeded(dispatch, getState, cueToUpdate.addId, responseCueDto);
            };
            updateCueCallback({ editingTrack, cue: cueToUpdate, onSaveSuccess });
        }
    }
};

const saveCueUpdateRequest = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction | undefined>>,
    getState: Function
): void => {
    const cueIdsToUpdate: string[] = [ ...getState().saveCueUpdate.cueUpdateIds ];
    dispatch(saveCueUpdateSlice.actions.clearCueUpdateIds());
    if (cueIdsToUpdate.length === 0) {
        return;
    }
    executeCueUpdateCallback(dispatch, getState, cueIdsToUpdate);
};

const saveCueUpdateDebounced = debounce(saveCueUpdateRequest, DEBOUNCE_TIMEOUT, { leading: false, trailing: true });

export const callSaveCueUpdate = (cueIndex: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction | undefined> | void>, getState): void => {
    const cue = getState().cues[cueIndex];
    if (cue) {
        const cueId = cue.addId ? cue.addId : cue.id;
        dispatch(saveCueUpdateSlice.actions.addCueIdsForUpdate(cueId));
        saveCueUpdateDebounced(dispatch, getState);
    }
};
