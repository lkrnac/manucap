import "video.js"; // VTTCue definition
import { AnyAction } from "@reduxjs/toolkit";
import deepFreeze from "deep-freeze";

import { searchCueText, setValidationErrors, updateEditingCueIndex } from "./cueEditorSlices";
import { CueDto, CueError, Track } from "../../model";
import { createTestingStore } from "../../../testUtils/testingStore";
import { updateEditingTrack } from "../../trackSlices";
import { updateCues } from "../cuesList/cuesListActions";

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
} as Track;

const testingCues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
    {
        vttCue: new VTTCue(4, 6, "Caption Line 3"),
        cueCategory: "ONSCREEN_TEXT",
        spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
    },
    {
        vttCue: new VTTCue(6, 8, "Caption Line 2"),
        cueCategory: "ONSCREEN_TEXT"
    },
] as CueDto[];

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
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
        });

        it("update scroll position when positive", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(3) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(3);
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

    describe("searchCueText supports regex special character escaping", () => {
        test.each([
            ["$", "$te$est$"], ["[", "[te[est["], ["]", "]te]est]"], ["-", "-te-est-"],
            ["\\", "\\te\\est\\"], ["^", "^te^est^"], ["*", "*te*est*"], ["+", "+te+est+"],
            ["?", "?te?est?"], [".", ".te.est."], ["(", "(te(est("], [")", ")te)est)"],
            ["|", "|te|est|"], ["{", "{te{est{"], ["}", "}te}est}"], [")", ")te)est)"],
            ["/", "/te/est/"]
        ])(
            "returns proper search result array for special character %s",
            (find: string, text: string) => {
                // WHEN
                const result = searchCueText(text, find, false);

                //THEN
                expect(result).toEqual([0, 3, 7]);
            },
        );

        test.each([
            ["<i>Editing</i> Line Wrapped text and", "text", [21]],
            ["<i>Editing</i> <u>Line</u> Wrapped text and", "text", [21]],
            ["<i>Editing</i> <u>Line</u> Wr$%^&apped text and", "text", [25]],
            ["<i>Editing</i> <u>Line</u> $ >> Wr$%^&apped text and", "text", [30]],
            ["<i>Editing</i> Line $ >> Wr$%^&apped text and text", "text", [30, 39]],
            ["<i>Editing</i> Line $ <strong>>></strong> Wr$%^&apped text and", ">>", [15]],
            ["<i>Editing</i> Line $ <strong>>></strong> Wr$%^&apped text", "$", [13, 20]]
        ])(
            "returns proper search result for html text %s",
            (html: string, find: string, expectedResult: number[]) => {
            // WHEN
            const result = searchCueText(html, find, false);

            // THEN
            expect(result).toEqual(expectedResult);
        });
    });
});
