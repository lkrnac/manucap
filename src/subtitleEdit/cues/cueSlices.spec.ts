import "video.js"; // VTTCue definition
import {
    addCue,
    applyShiftTime,
    deleteCue,
    updateCueCategory,
    updateCues,
    updateEditingCueIndex,
    updateSourceCues,
    updateVttCue
} from "./cueSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { CueDto } from "../model";
import { EditorState } from "draft-js";
import { createTestingStore } from "../../testUtils/testingStore";
import deepFreeze from "deep-freeze";
import { updateEditorState } from "./edit/editorStatesSlice";

const testingCues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("cueSlices", () => {
    beforeEach(() => testingStore = createTestingStore());
    describe("updateVttCue", () => {
        it("update top level cue", () => {
            // WHEN
            testingStore.dispatch(updateVttCue(3, new VTTCue(1, 2, "Dummy Cue")) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[3].vttCue).toEqual(new VTTCue(1, 2, "Dummy Cue"));
        });
    });

    describe("updateCueCategory", () => {
        it("ignores category update if cue doesn't exist in top level cues", () => {
            // WHEN
            testingStore.dispatch(updateCueCategory(3, "ONSCREEN_TEXT") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[3]).toBeUndefined();
        });

        it("updates top level cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateCueCategory(1, "ONSCREEN_TEXT") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].cueCategory).toEqual("ONSCREEN_TEXT");
        });
    });

    describe("addCue", () => {
        it("adds cue to the end of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(
                addCue(2, { vttCue: new VTTCue(2, 3, "Dummy Cue End"), cueCategory: "LYRICS" }) as {} as AnyAction
            );

            // THEN
            expect(testingStore.getState().cues[1].vttCue).toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().cues[2].vttCue).toEqual(new VTTCue(2, 3, "Dummy Cue End"));
            expect(testingStore.getState().cues[2].cueCategory).toEqual("LYRICS");
            expect(testingStore.getState().editingCueIndex).toEqual(2);
        });

        it("add cue in middle of cue array cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const vttCue = new VTTCue(0.5, 1, "Dummy Cue Insert");

            // WHEN
            testingStore.dispatch(addCue(1, { vttCue, cueCategory: "DIALOGUE" }) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue).toEqual(vttCue);
            expect(testingStore.getState().cues[2].vttCue).toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().cues[2].cueCategory).toEqual("DIALOGUE");
            expect(testingStore.getState().editingCueIndex).toEqual(1);
        });

        it("resets editor states map in Redux", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(updateEditorState(0, EditorState.createEmpty()) as {} as AnyAction);
            testingStore.dispatch(updateEditorState(1, EditorState.createEmpty()) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(
                addCue(2, { vttCue: new VTTCue(2, 3, "Dummy Cue End"), cueCategory: "LYRICS" }) as {} as AnyAction
            );

            // THEN
            expect(testingStore.getState().editorStates.size).toEqual(0);
        });
    });

    describe("deleteCue", () => {
        it("deletes cue at the beginning of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(1);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });

        it("deletes cue in the middle of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const vttCue = new VTTCue(0.5, 1, "Dummy Cue Insert");
            testingStore.dispatch(addCue(1, { vttCue, cueCategory: "DIALOGUE" }) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(0, 1, "Caption Line 1"));
            expect(testingStore.getState().cues[1].vttCue).toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });

        it("deletes cue at the end of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(0, 1, "Caption Line 1"));
            expect(testingStore.getState().cues.length).toEqual(1);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });

        it("removes editor states for certain index from Redux", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(updateEditorState(0, EditorState.createEmpty()) as {} as AnyAction);
            testingStore.dispatch(updateEditorState(1, EditorState.createEmpty()) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editorStates.size).toEqual(1);
            expect(testingStore.getState().editorStates.get(1)).toBeUndefined();
        });

        it("delete all cues in the array leaves one default empty cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(1) as {} as AnyAction);
            testingStore.dispatch(deleteCue(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(0, 3, ""));
            expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
            expect(testingStore.getState().cues.length).toEqual(1);
        });
    });

    describe("updateCues", () => {
        it("initializes cues", () => {
            // WHEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues).toEqual(testingCues);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });

        it("replaces existing cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const replacementCues = [
                { vttCue: new VTTCue(2, 3, "Replacement"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            // WHEN
            testingStore.dispatch(updateCues(replacementCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues).toEqual(replacementCues);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });
    });

    describe("updateEditingCueIndex", () => {
        it("updates editing cue index", () => {
            // WHEN
            testingStore.dispatch(updateEditingCueIndex(5) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(5);
        });
    });

    describe("updateSourceCues", () => {
        it("initializes source cues", () => {
            // WHEN
            testingStore.dispatch(updateSourceCues(testingCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().sourceCues).toEqual(testingCues);
        });

        it("replaces existing source cues", () => {
            // GIVEN
            testingStore.dispatch(updateSourceCues(testingCues) as {} as AnyAction);
            const replacementCues = [
                { vttCue: new VTTCue(2, 3, "Replacement"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            // WHEN
            testingStore.dispatch(updateSourceCues(replacementCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().sourceCues).toEqual(replacementCues);
        });
    });


    describe("applyShiftTime", () => {
        it("apply shift time", () => {
            //GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(applyShiftTime(2.123) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(2.123);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3.123);
        });
    });

});
