import { createTestingStore } from "../../../testUtils/testingStore";
import { changeScrollPosition } from "./cuesListScrollSlice";
import { CueDto, ScrollPosition } from "../../model";
import { AnyAction } from "@reduxjs/toolkit";
import each from "jest-each";
import { MatchedCuesWithEditingFocus } from "./cuesListTimeMatching";
import deepFreeze from "deep-freeze";

const testingMatchedCues = { matchedCues: [], editingFocusIndex: 58 } as MatchedCuesWithEditingFocus;
testingMatchedCues.matchedCues = Array.from({ length: 120 }, () => ({}));

const testingSourceCues = Array.from({ length: 120 }, (_element, index) => (
    { vttCue: new VTTCue(index, index + 1, "Source Line " + index), cueCategory: "DIALOGUE" } as CueDto
));

const testingTargetCues = Array.from({ length: 70 },(_element, index) => (
    { vttCue: new VTTCue(index, index + 1, "Target Line " + index), cueCategory: "DIALOGUE" } as CueDto
));

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("cuesListScrollSlice", () => {
    describe("changeScrollPosition", () => {
        beforeEach(() => {
            testingStore = createTestingStore({
                matchedCues: testingMatchedCues,
                cues: testingTargetCues,
                sourceCues: testingSourceCues,
                editingCueIndex: 58,
                currentPlayerTime: 65,
                focusedCueIndex: 60
            });
        });

        each([
            [ScrollPosition.NONE, 60],
            [ScrollPosition.FIRST, 0],
            [ScrollPosition.LAST, 119],
            [ScrollPosition.CURRENT, 58],
            [ScrollPosition.PLAYBACK, 64],
            [ScrollPosition.NEXT_PAGE, 100],
            [ScrollPosition.PREVIOUS_PAGE, 49],
            [ScrollPosition.LAST_TRANSLATED, 69],
        ])
        .it("updates scroll position focused cue index in Redux store for scroll position %s", (
            scrollPosition: ScrollPosition,
            expectedFocusedCueIndex: number
        ) => {
            // WHEN
            testingStore.dispatch(changeScrollPosition(scrollPosition) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(expectedFocusedCueIndex);
        });
    });
});
