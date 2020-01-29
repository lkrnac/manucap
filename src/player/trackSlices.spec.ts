import "video.js"; // VTTCue definition
import { CueDto, Task, Track } from "./model";
import {
    addCue,
    deleteCue,
    updateCueCategory,
    updateCues,
    updateEditingTrack,
    updateTask,
    updateVttCue
} from "./trackSlices";
import { createTestingStore } from "../testUtils/testingStore";
import deepFreeze from "deep-freeze";

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
    videoTitle: "This is the video title",
} as Track;

const testingTask = {
    type: "TASK_CAPTION",
    projectName: "Project One",
    dueDate: "2019/12/30 10:00AM"
} as Task;

const testingCues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("trackSlices", () => {
    beforeEach(() => testingStore = createTestingStore());
    describe("updateVttCue", () => {
        it("updates top level cues", () => {
            // WHEN
            testingStore.dispatch(updateVttCue(3, new VTTCue(1, 2, "Dummy Cue")));

            // THEN
            expect(testingStore.getState().cues[3].vttCue).toEqual(new VTTCue(1, 2, "Dummy Cue"));
        });
    });

    describe("updateCueCategory", () => {
        it("ignores category update if cue doesn't exist in top level cues", () => {
            // WHEN
            testingStore.dispatch(updateCueCategory(3, "ONSCREEN_TEXT"));

            // THEN
            expect(testingStore.getState().cues[3]).toBeUndefined();
        });

        it("updates top level cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues));

            // WHEN
            testingStore.dispatch(updateCueCategory(1, "ONSCREEN_TEXT"));

            // THEN
            expect(testingStore.getState().cues[1].cueCategory).toEqual("ONSCREEN_TEXT");
        });
    });

    describe("addCue", () => {
        it("adds cue to the end of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues));

            // WHEN
            testingStore.dispatch(addCue(2, new VTTCue(2, 3, "Dummy Cue End")));

            // THEN
            expect(testingStore.getState().cues[1].vttCue).toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().cues[2].vttCue).toEqual(new VTTCue(2, 3, "Dummy Cue End"));
        });

        it("add cue in middle of cue array cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues));

            // WHEN
            testingStore.dispatch(addCue(1, new VTTCue(0.5, 1, "Dummy Cue Insert")));

            // THEN
            expect(testingStore.getState().cues[1].vttCue).toEqual(new VTTCue(0.5, 1, "Dummy Cue Insert"));
            expect(testingStore.getState().cues[2].vttCue).toEqual(new VTTCue(1, 2, "Caption Line 2"));
        });
    });

    describe("deleteCue", () => {
        it("deletes cue at the beginning of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues));

            // WHEN
            testingStore.dispatch(deleteCue(   0));

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(1);
        });

        it("deletes cue in the middle of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues));
            testingStore.dispatch(addCue(1, new VTTCue(0.5, 1, "Dummy Cue Insert")));

            // WHEN
            testingStore.dispatch(deleteCue(1));

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(0, 1, "Caption Line 1"));
            expect(testingStore.getState().cues[1].vttCue).toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(2);
        });

        it("deletes cue at the end of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues));

            // WHEN
            testingStore.dispatch(deleteCue(1));

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(0, 1, "Caption Line 1"));
            expect(testingStore.getState().cues.length).toEqual(1);
        });
    });

    describe("updateEditingTrack", () => {
        it("updates editing track", () => {
            // WHEN
            testingStore.dispatch(updateEditingTrack(testingTrack));

            // THEN
            expect(testingStore.getState().editingTrack).toEqual(testingTrack);
        });
    });

    describe("updateTask", () => {
        it("updates task", () => {
            // WHEN
            testingStore.dispatch(updateTask(testingTask));

            // THEN
            expect(testingStore.getState().task).toEqual(testingTask);
        });
    });
});
