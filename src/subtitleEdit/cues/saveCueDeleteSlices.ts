import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CueDto, SaveTrackCue } from "../model";

export interface SaveCueDelete {
    deleteCue: ((trackCue: SaveTrackCue) => Promise<string>) | null;
}

const initSaveCueDelete = {
    deleteCue: null
} as SaveCueDelete;

export const saveCueDeleteSlice = createSlice({
    name: "saveCueDelete",
    initialState: initSaveCueDelete,
    reducers: {
        setDeleteCueCallback: (state, action: PayloadAction<(trackCue: SaveTrackCue) => Promise<string>>): void => {
            state.deleteCue = action.payload;
        }
    }
});

const executeCueDeleteCallback = (
    getState: Function,
    cueToDelete: CueDto
): void => {
    const deleteCueCallback = getState().saveCueDelete.deleteCue;
    const editingTrack = getState().editingTrack;
    deleteCueCallback({ editingTrack, cue: cueToDelete });
};

export const callSaveCueDelete = (
    getState: Function,
    cueToDelete: CueDto
): void => {
    executeCueDeleteCallback(getState, cueToDelete);
};
