import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../../../testUtils/testingStore";

import {
    replaceCurrentMatch,
    searchCueText,
    searchNextCues,
    searchPreviousCues, searchReplaceSlice,
    setFind, setMatchCase,
    setReplacement,
    showSearchReplace
} from "./searchReplaceSlices";
import { updateCues } from "../cuesList/cuesListActions";
import { CueDto } from "../../model";
import { updateEditingCueIndex } from "../edit/cueEditorSlices";
import { SearchReplaceMatches } from "./model";

const testingCues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
    {
        vttCue: new VTTCue(4, 6, "Caption Line 3"),
        cueCategory: "ONSCREEN_TEXT",
        spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
    },
] as CueDto[];

const testingCuesWithEditDisabled = [
    { vttCue: new VTTCue(0, 2, "Caption Line 2"), cueCategory: "DIALOGUE", editDisabled: true },
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
    {
        vttCue: new VTTCue(4, 6, "Caption Line 3"),
        cueCategory: "ONSCREEN_TEXT",
        spellCheck: { matches: [{ message: "some-spell-check-problem" }]},
        editDisabled: false
    },
    {
        vttCue: new VTTCue(6, 9, "Caption Line 4"), cueCategory: "ONSCREEN_TEXT",
        editDisabled: true
    },
] as CueDto[];

let testingStore = createTestingStore();

describe("searchReplaceSlices", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

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
            expect(testingStore.getState().searchReplace.matches.offsets).toEqual([8]);
            expect(testingStore.getState().searchReplace.matches.offsetIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.matches.matchLength).toEqual(6);
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

    describe("setMatchCase", () => {
        afterEach(() => {
            testingStore.dispatch(setMatchCase(false) as {} as AnyAction);
        });

        it("sets match case state", () => {
            // WHEN
            testingStore.dispatch(setMatchCase(true) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.matchCase).toBeTruthy();
        });

        it("updates search matches on editing cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
            testingStore.dispatch(setFind("line 2") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(setMatchCase(true) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("line 2");
            expect(testingStore.getState().searchReplace.matchCase).toBeTruthy();
            expect(testingStore.getState().searchReplace.matches.offsets).toEqual([]);
            expect(testingStore.getState().searchReplace.matches.offsetIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.matches.matchLength).toEqual(6);
        });
    });

    describe("searchNextCues", () => {
        it("searches for find term in next cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("line 2") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("line 2");
            expect(testingStore.getState().searchReplace.direction).toEqual("NEXT");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
        });

        it("searches for find term in next cue match case - no match", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setMatchCase(true) as {} as AnyAction);
            testingStore.dispatch(setFind("line 2") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("line 2");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(null);
        });

        it("searches for find term in next cue match case - with match", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setMatchCase(true) as {} as AnyAction);
            testingStore.dispatch(setFind("Line 2") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
        });

        it("searches for find term in cue with many matches next", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [8, 16],
                offsetIndex: 0,
                matchLength: 3
            } as SearchReplaceMatches;
            testingStore.dispatch(searchReplaceSlice.actions.setMatches(searchReplaceMatches));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE"

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
            expect(testingStore.getState().searchReplace.matches.offsets).toEqual([8, 16]);
            expect(testingStore.getState().searchReplace.matches.offsetIndex).toEqual(1);
            expect(testingStore.getState().searchReplace.matches.matchLength).toEqual(3);
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
        });

        it("sets editing cue index to next when current cue is end of matches", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [8, 16],
                offsetIndex: 1,
                matchLength: 3
            } as SearchReplaceMatches;
            testingStore.dispatch(searchReplaceSlice.actions.setMatches(searchReplaceMatches));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE"
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
            expect(testingStore.getState().focusedCueIndex).toEqual(1);
        });

        it("wraps search to first when current cue is last", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [13],
                offsetIndex: 0,
                matchLength: 3
            } as SearchReplaceMatches;
            testingStore.dispatch(searchReplaceSlice.actions.setMatches(searchReplaceMatches));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE"
                },
                { vttCue: new VTTCue(2, 4, "Caption foo"), cueCategory: "ONSCREEN_TEXT" },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line foo"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
        });

        it("stops search if last cue match is last in whole track - next", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [13],
                offsetIndex: 0,
                matchLength: 3
            } as SearchReplaceMatches;
            testingStore.dispatch(searchReplaceSlice.actions.setMatches(searchReplaceMatches));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption bar and bar"),
                    cueCategory: "DIALOGUE"
                },
                { vttCue: new VTTCue(2, 4, "Caption bar"), cueCategory: "ONSCREEN_TEXT" },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line foo"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(2);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
        });

        it("sets editing cue index to next and first offsetIndex for cue", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [8, 16],
                offsetIndex: 1,
                matchLength: 3
            } as SearchReplaceMatches;
            testingStore.dispatch(searchReplaceSlice.actions.setMatches(searchReplaceMatches));
            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE"
                },
                {
                    vttCue: new VTTCue(2, 4, "Caption foo"),
                    cueCategory: "ONSCREEN_TEXT"
                },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.matches.offsetIndex).toEqual(1);
            expect(testingStore.getState().searchReplace.matches.offsets).toEqual([8, 16]);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
        });

        it("handles cues with empty cleansed vtt text", () => {
            // GIVEN
            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "<b/>"),
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
            expect(testingStore.getState().focusedCueIndex).toEqual(1);
        });

        it("doesn't skip cues with editDisabled when searches for find term in next cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCuesWithEditDisabled) as {} as AnyAction);
            testingStore.dispatch(setFind("Line 2") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
            expect(testingStore.getState().searchReplace.direction).toEqual("NEXT");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(1);
        });

        it("doesn't skip cues with editDisabled when wrapping searches for find term in next cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCuesWithEditDisabled) as {} as AnyAction);
            testingStore.dispatch(setFind("Caption Line") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Caption Line");
            expect(testingStore.getState().searchReplace.direction).toEqual("NEXT");
            expect(testingStore.getState().editingCueIndex).toEqual(3);
            expect(testingStore.getState().focusedCueIndex).toEqual(1);
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

        it("does not search if there are no cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues([]) as {} as AnyAction);
            testingStore.dispatch(setFind("test") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("test");
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
            expect(testingStore.getState().searchReplace.direction).toEqual("PREVIOUS");
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().focusedCueIndex).toEqual(1);
        });

        it("searches for find term in cue with many matches previous", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [8, 16],
                offsetIndex: 1,
                matchLength: 3
            } as SearchReplaceMatches;
            testingStore.dispatch(searchReplaceSlice.actions.setMatches(searchReplaceMatches));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE"
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
            expect(testingStore.getState().searchReplace.matches.offsets).toEqual([8, 16]);
            expect(testingStore.getState().searchReplace.matches.offsetIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.matches.matchLength).toEqual(3);
            expect(testingStore.getState().searchReplace.matches).toBeUndefined();
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
        });

        it("wraps search to last cue when current cue is first", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [8],
                offsetIndex: 0,
                matchLength: 3
            } as SearchReplaceMatches;
            testingStore.dispatch(searchReplaceSlice.actions.setMatches(searchReplaceMatches));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo"),
                    cueCategory: "DIALOGUE"
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
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().focusedCueIndex).toEqual(1);
        });

        it("stops search if last cue match is last in whole track - next", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [8],
                offsetIndex: 0,
                matchLength: 3
            } as SearchReplaceMatches;
            testingStore.dispatch(searchReplaceSlice.actions.setMatches(searchReplaceMatches));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption testing"),
                    cueCategory: "DIALOGUE"
                },
                {
                    vttCue: new VTTCue(2, 4, "Caption foo"),
                    cueCategory: "ONSCREEN_TEXT"
                },
                {
                    vttCue: new VTTCue(4, 6, "Caption bar"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().focusedCueIndex).toEqual(1);
        });

        it("wraps search to last cue when current cue is last on top", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [8],
                offsetIndex: 0,
                matchLength: 3
            } as SearchReplaceMatches;
            testingStore.dispatch(searchReplaceSlice.actions.setMatches(searchReplaceMatches));
            const testingCues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption testing"),
                    cueCategory: "DIALOGUE"
                },
                {
                    vttCue: new VTTCue(2, 4, "Caption foo"),
                    cueCategory: "ONSCREEN_TEXT"
                },
                {
                    vttCue: new VTTCue(4, 6, "Caption foo"),
                    cueCategory: "ONSCREEN_TEXT",
                    spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
                },
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(setFind("foo") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("foo");
            expect(testingStore.getState().editingCueIndex).toEqual(2);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
        });

        it("sets editing cue index to previous when current cue is end of matches", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [8, 16],
                offsetIndex: 0,
                matchLength: 3
            } as SearchReplaceMatches;
            testingStore.dispatch(searchReplaceSlice.actions.setMatches(searchReplaceMatches));
            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo"),
                    cueCategory: "DIALOGUE"
                },
                {
                    vttCue: new VTTCue(2, 4, "Caption foo and foo"),
                    cueCategory: "ONSCREEN_TEXT"
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
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
        });

        it("sets editing cue index to previous and last offsetIndex for cue", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [8],
                offsetIndex: 0,
                matchLength: 3
            } as SearchReplaceMatches;
            testingStore.dispatch(searchReplaceSlice.actions.setMatches(searchReplaceMatches));
            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption foo and foo"),
                    cueCategory: "DIALOGUE"
                },
                {
                    vttCue: new VTTCue(2, 4, "Caption foo"),
                    cueCategory: "ONSCREEN_TEXT"
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
            expect(testingStore.getState().searchReplace.matches.offsetIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.matches.offsets).toEqual([8, 16]);
            expect(testingStore.getState().searchReplace.matches.offsetIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.matches.offsets).toEqual([8]);
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
        });

        it("skips cues with editDisabled when searches for find term in previous cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCuesWithEditDisabled) as {} as AnyAction);
            testingStore.dispatch(setFind("Caption Line") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Caption Line");
            expect(testingStore.getState().searchReplace.direction).toEqual("PREVIOUS");
            expect(testingStore.getState().editingCueIndex).toEqual(2);
            expect(testingStore.getState().focusedCueIndex).toEqual(2);
        });

        it("skips cues with editDisabled when wrapping searches for find term in previous cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCuesWithEditDisabled) as {} as AnyAction);
            testingStore.dispatch(setFind("Caption Line") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Caption Line");
            expect(testingStore.getState().searchReplace.direction).toEqual("PREVIOUS");
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().focusedCueIndex).toEqual(1);
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

        it("does not search if there are no cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues([]) as {} as AnyAction);
            testingStore.dispatch(setFind("test") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("test");
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

        it("updates search matches on editing cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
            testingStore.dispatch(setFind("line 2") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(showSearchReplace(false) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("");
            expect(testingStore.getState().searchReplace.matches.offsets).toEqual([]);
            expect(testingStore.getState().searchReplace.matches.offsetIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.matches.matchLength).toEqual(0);
        });
    });

    describe("replaceCurrentMatch", () => {
        it("sets replacement", () => {
            // WHEN
            testingStore.dispatch(replaceCurrentMatch("replacementValue") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.replacement).toEqual("replacementValue");
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
