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
import { SubtitleSpecification } from "../toolbox/model";
import { readSubtitleSpecification } from "../toolbox/subtitleSpecificationSlice";

const testingCues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

const testingCuesWithGaps = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(4, 6, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("cueSlices", () => {
    beforeEach(() => testingStore = createTestingStore());
    describe("updateVttCue", () => {
        it("update top level cue", () => {
            // WHEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            testingStore.dispatch(updateVttCue(1, new VTTCue(2, 2.5, "Dummy Cue")) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2.5);
        });

        it("apply invalid end time prevention on start time change", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateVttCue(0, new VTTCue(2, 2, "Dummy Cue")) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1.5);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy Cue");
        });

        it("apply invalid end time prevention on end time change", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(1, 0, "Dummy Cue")) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2.5);
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
        });


        it("apply overlap prevention for end time", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateVttCue(0, new VTTCue(0, 2, "Dummy Cue")) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy Cue");
        });

        it("apply overlap prevention for start time", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(0, 2, "Dummy Cue")) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2.5);
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
        });

        it("apply line count prevention according to subtitle specs", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 30,
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(0, 2, "Dummy \n\nCue")) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
        });

        it("apply line character line count limitation to first line", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 10,
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(0, 2, "Long line 1\nline 2")) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
        });

        it("apply line character line count limitation to second line", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 10,
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(0, 2, "line 1\nlong line 2")) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
        });

        it("do not count HTML tags into line count limitation", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 10,
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(0, 2, "line 1\n<i>l<b>ine</b></i> 2")) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("line 1\n<i>l<b>ine</b></i> 2");
        });

        it("Adjust startTime to follow min caption gap passed from subtitle spec", () => {
            // GIVEN
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: 1200,
                maxCaptionDurationInMillis: 4000,
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 30,
                enabled: true
            } as SubtitleSpecification;

            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(3, 4, "Dummy Cue")) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2.8);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
        });


        it("Adjust endtime to follow min caption gap passed from subtitle spec", () => {
            // GIVEN
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: 1200,
                maxCaptionDurationInMillis: 4000,
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 30,
                enabled: true
            } as SubtitleSpecification;

            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(2, 3, "Dummy Cue")) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(3.2);
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
        });

        it("Adjust startTime to follow max caption gap passed from subtitle spec", () => {
            // GIVEN
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: 500,
                maxCaptionDurationInMillis: 1000,
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 30,
                enabled: true
            } as SubtitleSpecification;

            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(2.8, 4, "Dummy Cue")) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(3);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
        });


        it("Adjust endtime to follow max caption gap passed from subtitle spec", () => {
            // GIVEN
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: 500,
                maxCaptionDurationInMillis: 1000,
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 30,
                enabled: true
            } as SubtitleSpecification;

            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(2, 5, "Dummy Cue")) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(3);
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
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
                addCue(2, { vttCue: new VTTCue(2, 4, "Dummy Cue End"), cueCategory: "LYRICS" }) as {} as AnyAction
            );

            // THEN
            expect(testingStore.getState().cues[1].vttCue).toEqual(new VTTCue(2, 4, "Caption Line 2"));
            expect(testingStore.getState().cues[2].vttCue).toEqual(new VTTCue(2, 4, "Dummy Cue End"));
            expect(testingStore.getState().cues[2].cueCategory).toEqual("LYRICS");
            expect(testingStore.getState().editingCueIndex).toEqual(2);
        });

        it("add cue in middle of cue array cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues( [
                { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4.225, 5, "Caption Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);
            const vttCue = new VTTCue(1, 2, "Dummy Cue Insert");

            // WHEN
            testingStore.dispatch(addCue(1, { vttCue, cueCategory: "DIALOGUE" }) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue).toEqual(vttCue);
            expect(testingStore.getState().cues[2].vttCue).toEqual(new VTTCue(4.225, 5, "Caption Line 2"));
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

        it("Adjust endTime to be following cue startTime if it exeeds following startTime", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(
                addCue(1, { vttCue: new VTTCue(2, 5, "Dummy Cue End"), cueCategory: "LYRICS" }) as {} as AnyAction
            );

            // THEN
            expect(testingStore.getState().cues.length).toEqual(3);
            expect(testingStore.getState().cues[1].vttCue.starTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
        });

        it("Does not add cue if duration is less than min gap limit", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: 3000,
                maxCaptionDurationInMillis: 5000,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(
                addCue(1, { vttCue: new VTTCue(2, 4, "Dummy Cue End"), cueCategory: "LYRICS" }) as {} as AnyAction
            );

            // THEN
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(4);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(6);
        });
    });

    describe("deleteCue", () => {
        it("deletes cue at the beginning of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(2, 4, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(1);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });

        it("deletes cue in the middle of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues( [
                { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4.225, 5, "Caption Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);
            const vttCue = new VTTCue(2, 2, "Dummy Cue Insert");
            testingStore.dispatch(addCue(1, { vttCue, cueCategory: "DIALOGUE" }) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(0, 2, "Caption Line 1"));
            expect(testingStore.getState().cues[1].vttCue).toEqual(new VTTCue(4.225, 5, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });

        it("deletes cue at the end of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(0, 2, "Caption Line 1"));
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

        it("resets subtitle edits states", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(updateEditorState(0, EditorState.createEmpty()) as {} as AnyAction);
            const replacementCues = [
                { vttCue: new VTTCue(2, 3, "Replacement"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            // WHEN
            testingStore.dispatch(updateCues(replacementCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editorStates.size).toEqual(0);
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
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(4.123);
        });
    });

});
