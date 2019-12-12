import {createSlice, PayloadAction} from "@reduxjs/toolkit";
// import { useDispatch } from "react-redux";
import {Track} from "./model";
import {CueAction, updateCues} from "./cueSlices";
import {Dispatch} from "react";
import {AppThunk, SubtitleEditAction} from "../reducers/subtitleEditReducer";

// interface CueAction {
//     idx: number;
//     cue: VTTCue;
// }

interface EditingTrackAction extends SubtitleEditAction {
    editingTrack: Track;
}

// interface CuesAction {
//     cues: VTTCue[];
// }
//
// const dispatch = useDispatch();

export const editingTrackSlice = createSlice({
    name: "editingTrack",
    initialState: null as Track | null,
    reducers: {
        updateEditingTrack: (_state, action: PayloadAction<EditingTrackAction>): Track => action.payload.editingTrack,
        updateEditingTrackCues: (state, action: PayloadAction<CueAction>): void => {
            if (state) {
                const cues = state.currentVersion ? state.currentVersion.cues : [];
                cues[action.payload.idx] = action.payload.cue;
                state.currentVersion = { cues };
            }
            // return ({  ...state, currentVersion: { cues } } as Track);
        }
    }
});

export const {updateEditingTrackCues} = editingTrackSlice.actions;

export const updateEditingTrack = (track: Track): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(editingTrackSlice.actions.updateEditingTrack({ editingTrack: track }));
        const cues = track && track.currentVersion ? track.currentVersion.cues : [] as VTTCue[];
        dispatch(updateCues({ cues }));
    };

// export const updateEditingTrack = (editingTrack: Track): void => {
//     dispatch(editingTrackSlice.actions.updateEditingTrack({editingTrack}));
// };
//
// export const updateEditingTrackCues = (cues: VTTCue[]): void => {
//     dispatch(editingTrackSlice.actions.updateEditingTrackCues({cues}));
// };

// export const cuesSlice = createSlice({
//     name: "cues",
//     initialState: [] as VTTCue[],
//     reducers: {
//         updateCue: (state, action: PayloadAction<CueAction>): VTTCue[] => {
//             const { idx, cue } = action.payload;
//             const cues = [...state];
//             cues[idx] = cue;
//             updateEditingTrackCues(cues);
//             return cues;
//         },
//         updateCues: (_state, action: PayloadAction<CuesAction>): VTTCue[] => [...action.payload.cues]
//     }
// });
//
// export const updateCue = (idx: number, cue: VTTCue): void => {
//     dispatch(cuesSlice.actions.updateCue({idx, cue}));
// };
//
// const updateCues = (cues: VTTCue[]): void => {
//     dispatch(cuesSlice.actions.updateCues({cues}));
// };

