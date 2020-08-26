import { AnyAction } from "@reduxjs/toolkit";
import testingStore from "../../../testUtils/testingStore";
import {searchNextCues, searchPreviousCues, setSearchReplace} from "./searchReplaceSlices";
import {updateCues} from "../cueSlices";
import {CueDto, ScrollPosition} from "../../model";

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
    describe("setSearchReplace", () => {
        it("sets search replace state", () => {
            // WHEN
            testingStore.dispatch(setSearchReplace("testing", 22) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("testing");
            expect(testingStore.getState().searchReplace.lastCueTextMatchIndex).toEqual(22);
        });
    });

    describe("searchNextCues", () => {
        it("searches for find term in cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchNextCues("Line 2") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
            expect(testingStore.getState().searchReplace.lastCueTextMatchIndex).toEqual(8);
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        });
    });

    describe("searchPreviousCues", () => {
        it("sets search replace state", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(searchPreviousCues("Line 2") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
            expect(testingStore.getState().searchReplace.lastCueTextMatchIndex).toEqual(8);
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        });
    });
});
