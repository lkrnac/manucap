import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CueDto, SubtitleEditAction } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";
import { editingTrackSlice } from "../../trackSlices";
import { matchedCuesSlice } from "../cuesList/cuesListSlices";

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
    (dispatch: Dispatch<PayloadAction<CuesAction>>, getState): void => {
        dispatch(sourceCuesSlice.actions.updateSourceCues({ cues }));
        const lastState = getState();
        dispatch(matchedCuesSlice.actions.matchCuesByTime(
            { cues: lastState.cues, sourceCues: lastState.sourceCues, editingCueIndex: lastState.editingCueIndex }
        ));
    };
