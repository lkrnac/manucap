import "video.js"; // VTTCue definition
import { AnyAction } from "@reduxjs/toolkit";
import deepFreeze from "deep-freeze";

import { setValidationErrors, updateEditingCueIndex } from "./cueEditorSlices";
import { CueError, ScrollPosition } from "../../model";
import { createTestingStore } from "../../../testUtils/testingStore";

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("cueSlices", () => {
    beforeEach(() => testingStore = createTestingStore());

    describe("updateEditingCueIndex", () => {
        it("updates editing cue index", () => {
            // WHEN
            testingStore.dispatch(updateEditingCueIndex(5) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(5);
        });

        it("update scroll position when zero", () => {
            // WHEN
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        });

        it("update scroll position when positive", () => {
            // WHEN
            testingStore.dispatch(updateEditingCueIndex(5) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        });

        it("doesn't update scroll position when less than zero", () => {
            // WHEN
            testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().scrollPosition).toBeUndefined;
        });
    });

    describe("setValidationError", () => {
        it("sets validation error", () => {
            //GIVEN

            // WHEN
            testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().validationErrors).toEqual([CueError.LINE_CHAR_LIMIT_EXCEEDED]);
        });
    });
});
