import { createTestingStore } from "../../../testUtils/testingStore";
import { changeScrollPosition, scrollPositionSlice } from "./cuesListScrollSlice";
import { ScrollPosition } from "../../model";
import { AnyAction } from "@reduxjs/toolkit";
import each from "jest-each";
import { MatchedCuesWithEditingFocus } from "./cuesListTimeMatching";
import deepFreeze from "deep-freeze";

const testingMatchedCues = { matchedCues: [], editingFocusIndex: 58 } as MatchedCuesWithEditingFocus;
testingMatchedCues.matchedCues = Array.from({ length: 120 }, () => ({}));

const cues = Array.from({ length: 70 }, () => ({}));

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("cuesListScrollSlice", () => {
    describe("changeScrollPosition", () => {
        beforeEach(() => {
            testingStore = createTestingStore({ matchedCues: testingMatchedCues, cues });
        });

        each([
            [ScrollPosition.NONE, 60],
            [ScrollPosition.FIRST, 0],
            [ScrollPosition.LAST, 119],
            [ScrollPosition.CURRENT, 58],
            // [ScrollPosition.PLAYBACK],
            [ScrollPosition.NEXT_PAGE, 100],
            [ScrollPosition.PREVIOUS_PAGE, 49],
            [ScrollPosition.LAST_TRANSLATED, 69],
        ])
        .it("updates scroll position focused cue index in Redux store for scroll position %s", (
            scrollPosition: ScrollPosition,
            expectedFocusedCueIndex: number
        ) => {
            // GIVEN
            testingStore.dispatch(scrollPositionSlice.actions.changeFocusedCueIndex(60));

            // WHEN
            testingStore.dispatch(changeScrollPosition(scrollPosition) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(expectedFocusedCueIndex);
        });
    });
});
