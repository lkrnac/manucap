import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {updateEditingTrackCues} from "./trackSlices";
import {AppThunk, SubtitleEditAction} from "../reducers/subtitleEditReducer";
import {Dispatch} from "react";
// import { createDispatchHook } from "react-redux";

export interface CueAction extends SubtitleEditAction {
    idx: number;
    cue: VTTCue;
}

interface CuesAction extends SubtitleEditAction {
    cues: VTTCue[];
}

// const dispatch = useDispatch();

export const cuesSlice = createSlice({
    name: "cues",
    initialState: [] as VTTCue[],
    reducers: {
        updateCue: (state, action: PayloadAction<CueAction>): VTTCue[] => {
            const cues = [...state];
            cues[action.payload.idx] = action.payload.cue;
            return cues;
        },
        updateCues: (_state, action: PayloadAction<CuesAction>): VTTCue[] => [...action.payload.cues]
    }
});

export const { updateCues } = cuesSlice.actions;

export const updateCue = (idx: number, cue: VTTCue): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueAction>>): void => {
        dispatch(cuesSlice.actions.updateCue({ idx, cue }));
        dispatch(updateEditingTrackCues({ idx, cue }));
    };

// export const updateCue = (idx: number, cue: VTTCue): void => {
//     dispatch(cuesSlice.actions.updateCue({idx, cue}));
// };
//
// export const updateCues = (cues: VTTCue[]): void => {
//     dispatch(cuesSlice.actions.updateCues({cues}));
// };

