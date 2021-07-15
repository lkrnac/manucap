import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CueDto, CueLineDto } from "../../model";
import { matchCuesByTime } from "./cuesListTimeMatching";

interface MatchCuesAction {
    cues: CueDto[];
    sourceCues: CueDto[];
    editingCueIndex: number;
}

export const matchedCuesSlice = createSlice({
    name: "matchedCues",
    initialState: [] as CueLineDto[],
    reducers: {
        matchCuesByTime: (_state, action: PayloadAction<MatchCuesAction>): CueLineDto[] =>
            matchCuesByTime(action.payload.cues, action.payload.sourceCues, action.payload.editingCueIndex).matchedCues
    },
});
