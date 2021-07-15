import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CueDto } from "../../model";
import { matchCuesByTime, MatchedCuesWithEditingFocus } from "./cuesListTimeMatching";

interface MatchCuesAction {
    cues: CueDto[];
    sourceCues: CueDto[];
    editingCueIndex: number;
}

export const matchedCuesSlice = createSlice({
    name: "matchedCues",
    initialState: { matchedCues: [], editingFocusIndex: 0 } as MatchedCuesWithEditingFocus,
    reducers: {
        matchCuesByTime: (_state, action: PayloadAction<MatchCuesAction>): MatchedCuesWithEditingFocus => {
            return matchCuesByTime(action.payload.cues, action.payload.sourceCues, action.payload.editingCueIndex);
        }
    },
});
