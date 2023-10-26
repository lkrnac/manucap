import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SubtitleEditAction, Track } from "./model";
import { AppThunk } from "./subtitleEditReducers";
import { Dispatch } from "react";

interface EditingTrackAction extends SubtitleEditAction {
    editingTrack: Track;
}

export const editingTrackSlice = createSlice({
    name: "editingTrack",
    initialState: null as Track | null,
    reducers: {
        updateEditingTrack: (state, action: PayloadAction<EditingTrackAction>): Track => {
            const track = action.payload.editingTrack;
            const currentTimecodesUnlocked = track.timecodesUnlocked !== undefined
                    ? track.timecodesUnlocked
                    : state?.timecodesUnlocked;
            const timecodesUnlocked = track.type === "TRANSLATION" ? currentTimecodesUnlocked : true;
            return { ...track, timecodesUnlocked };
        },
        resetEditingTrack: (): Track | null => null
    }
});

export const updateEditingTrack = (track: Track): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(editingTrackSlice.actions.updateEditingTrack({ editingTrack: track }));
    };

export const resetEditingTrack = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<void>>): void => {
        dispatch(editingTrackSlice.actions.resetEditingTrack());
    };
