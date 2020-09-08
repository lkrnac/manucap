import { AnyAction } from "@reduxjs/toolkit";
import testingStore from "../../../testUtils/testingStore";
import {
    replaceCurrentMatch,
    searchNextCues,
    searchPreviousCues,
    setFind,
    setReplacement,
    showSearchReplace
} from "./searchReplaceSlices";
import { updateCues, updateEditingCueIndex } from "../cueSlices";
import { CueDto, ScrollPosition } from "../../model";

const testingCues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
    {
        vttCue: new VTTCue(4, 6, "Caption Line 3"),
        cueCategory: "ONSCREEN_TEXT",
        spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
    },
] as CueDto[];

describe("searchReplaceSlices", () => {
    describe("setFind", () => {
        it("sets search replace find state", () => {
            // WHEN
            testingStore.dispatch(setFind("testing") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("testing");
        });

        it("updates search matches on editing cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(setFind("Line 2") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
            expect(testingStore.getState().cues[1].searchReplaceMatches.offsets).toEqual([8]);
            expect(testingStore.getState().cues[1].searchReplaceMatches.offsetIndex).toEqual(0);
            expect(testingStore.getState().cues[1].searchReplaceMatches.matchLength).toEqual(6);
            expect(testingStore.getState().cues[0].searchReplaceMatches).toBeUndefined();
        });
    });

    describe("setReplacement", () => {
        it("sets search replace replacement state", () => {
            // WHEN
            testingStore.dispatch(setReplacement("testing-repl") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.replacement).toEqual("testing-repl");
        });
    });

    describe("searchNextCues", () => {
        it("searches for find term in next cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("Line 2") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        });

        it("searches for find term in cue with many matches next", () => {
            // GIVEN
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE",
                    searchReplaceMatches: {
                        offsets: [8, 16],
                        offsetIndex: 0,
                        matchLength: 3
                    }

                },
                { vttCue: new VTTCue(2, 4, "Caption foo"), cueCategory: "ONSCREEN_TEXT" },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().cues[0].searchReplaceMatches.offsets).toEqual([8, 16]);
            expect(testingStore.getState().cues[0].searchReplaceMatches.offsetIndex).toEqual(1);
            expect(testingStore.getState().cues[0].searchReplaceMatches.matchLength).toEqual(3);
            expect(testingStore.getState().cues[1].searchReplaceMatches).toBeUndefined();
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        });

        it("sets editing cue index to next when current cue is end of matches", () => {
            // GIVEN
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE",
                    searchReplaceMatches: {
                        offsets: [8, 16],
                        offsetIndex: 1,
                        matchLength: 3
                    }
                },
                { vttCue: new VTTCue(2, 4, "Caption foo"), cueCategory: "ONSCREEN_TEXT" },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        });

        it("handles cues with empty cleansed vtt text", () => {
            // GIVEN
            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "<b></b>"),
                    cueCategory: "DIALOGUE"
                },
                { vttCue: new VTTCue(2, 4, "Caption foo"), cueCategory: "ONSCREEN_TEXT" },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT"
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        });

        it("does not search if find is empty string", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });
    });

    describe("searchPreviousCues", () => {
        it("searches for find term in previous cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("Line 2") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        });

        it("searches for find term in cue with many matches previous", () => {
            // GIVEN
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE",
                    searchReplaceMatches: {
                        offsets: [8, 16],
                        offsetIndex: 1,
                        matchLength: 3
                    }
                },
                { vttCue: new VTTCue(2, 4, "Caption foo"), cueCategory: "ONSCREEN_TEXT" },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().cues[0].searchReplaceMatches.offsets).toEqual([8, 16]);
            expect(testingStore.getState().cues[0].searchReplaceMatches.offsetIndex).toEqual(0);
            expect(testingStore.getState().cues[0].searchReplaceMatches.matchLength).toEqual(3);
            expect(testingStore.getState().cues[1].searchReplaceMatches).toBeUndefined();
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        });

        it("sets editing cue index to previous when current cue is end of matches", () => {
            // GIVEN
            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE"
                },
                {
                    vttCue: new VTTCue(2, 4, "Caption foo"),
                    cueCategory: "ONSCREEN_TEXT",
                    searchReplaceMatches: {
                        offsets: [8, 16],
                        offsetIndex: 0,
                        matchLength: 3
                    }
                },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        });

        it("does not search if find is empty string", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });
    });

    describe("showSearchReplace", () => {
        it("sets search replace visible", () => {
            // WHEN
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplaceVisible).toBeTruthy();
        });
    });

    describe("replaceCurrentMatch", () => {
        it("sets replace match signal", () => {
            // WHEN
            testingStore.dispatch(replaceCurrentMatch() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.replaceMatchCounter).toEqual(1);
        });
    });
});
