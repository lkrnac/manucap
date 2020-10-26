import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CueDto, SubtitleEditAction } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";
import { editingTrackSlice } from "../../trackSlices";

interface CuesAction extends SubtitleEditAction {
    cues: CueDto[];
}

export const sourceCuesSlice = createSlice({
    name: "sourceCues",
    initialState: [] as CueDto[],
    reducers: {
        updateSourceCues: (_state, action: PayloadAction<CuesAction>): CueDto[] => action.payload.cues
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CueDto[] => []
    }
});

export const updateSourceCues = (cues: CueDto[]): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CuesAction>>): void => {
        dispatch(sourceCuesSlice.actions.updateSourceCues({ cues }));
    };
