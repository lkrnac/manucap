import "video.js"; // VTTCue definition
import { Task, Track } from "./model";
import { addCue, deleteCue, updateCueCategory, updateEditingTrack, updateTask, updateVttCue } from "./trackSlices";
import deepFreeze from "deep-freeze";
import testingStore from "../testUtils/testingStore";

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
    videoTitle: "This is the video title",
    currentVersion: {
        cues: [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ]
    }
} as Track;

const testingTask = {
    type: "TASK_CAPTION",
    projectName: "Project One",
    dueDate: "2019/12/30 10:00AM"
} as Task;

deepFreeze(testingStore.getState());

describe("trackSlices", () => {
    describe("updateVttCue", () => {
        it("updates top level cues", () => {
            // WHEN
            testingStore.dispatch(updateVttCue(3, new VTTCue(1, 2, "Dummy Cue")));

            // THEN
            expect(testingStore.getState().cues[3].vttCue).toEqual(new VTTCue(1, 2, "Dummy Cue"));
        });

        it("updates cues in editing track", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(1, 2, "Dummy Cue")));

            // THEN
            // @ts-ignore - Test will fail if version is null
            expect(testingStore.getState().editingTrack.currentVersion.cues[1].vttCue)
                .toEqual(new VTTCue(1, 2, "Dummy Cue"));
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
            testingStore.dispatch(updateEditingTrack(testingTrack));

            // WHEN
            testingStore.dispatch(updateCueCategory(1, "ONSCREEN_TEXT"));

            // THEN
            expect(testingStore.getState().cues[1].cueCategory).toEqual("ONSCREEN_TEXT");
        });

        it("updates cues in editing track", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));

            // WHEN
            testingStore.dispatch(updateCueCategory(1, "ONSCREEN_TEXT"));

            // THEN
            // @ts-ignore - Test will fail if version is null
            expect(testingStore.getState().editingTrack.currentVersion.cues[1].cueCategory).toEqual("ONSCREEN_TEXT");
        });
    });

    describe("addCue", () => {
        it("adds cue to the end of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));

            // WHEN
            testingStore.dispatch(addCue(2, new VTTCue(2, 3, "Dummy Cue End"), "LYRICS"));

            // THEN
            expect(testingStore.getState().cues[1].vttCue).toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().cues[2].vttCue).toEqual(new VTTCue(2, 3, "Dummy Cue End"));
            expect(testingStore.getState().cues[2].cueCategory).toEqual("LYRICS");
        });

        it("add cue in middle of cue array cues", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));

            // WHEN
            testingStore.dispatch(addCue(1, new VTTCue(0.5, 1, "Dummy Cue Insert"), "DIALOGUE"));

            // THEN
            expect(testingStore.getState().cues[1].vttCue).toEqual(new VTTCue(0.5, 1, "Dummy Cue Insert"));
            expect(testingStore.getState().cues[2].vttCue).toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().cues[2].cueCategory).toEqual("DIALOGUE");
        });

        it("add cue in middle of cue array cues in editing track", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));

            // WHEN
            testingStore.dispatch(addCue(1, new VTTCue(0.5, 1, "Dummy Cue Insert"), "DIALOGUE"));

            // THEN
            expect(testingStore.getState().editingTrack.currentVersion.cues[1].vttCue)
                .toEqual(new VTTCue(0.5, 1, "Dummy Cue Insert"));
            expect(testingStore.getState().editingTrack.currentVersion.cues[2].vttCue)
                .toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().editingTrack.currentVersion.cues[2].cueCategory).toEqual("DIALOGUE");
        });
    });

    describe("deleteCue", () => {
        it("deletes cue at the beginning of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));

            // WHEN
            testingStore.dispatch(deleteCue(   0));

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(1);
        });

        it("deletes cue in the middle of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));
            testingStore.dispatch(addCue(1, new VTTCue(0.5, 1, "Dummy Cue Insert"), "DIALOGUE"));

            // WHEN
            testingStore.dispatch(deleteCue(1));

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(0, 1, "Caption Line 1"));
            expect(testingStore.getState().cues[1].vttCue).toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(2);
        });

        it("deletes cue in middle of cue array cues in editing track", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));
            testingStore.dispatch(addCue(1, new VTTCue(0.5, 1, "Dummy Cue Insert"), "DIALOGUE"));

            // WHEN
            testingStore.dispatch(deleteCue(1));

            // THEN
            expect(testingStore.getState().editingTrack.currentVersion.cues[0].vttCue)
                .toEqual(new VTTCue(0, 1, "Caption Line 1"));
            expect(testingStore.getState().editingTrack.currentVersion.cues[1].vttCue)
                .toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().editingTrack.currentVersion.cues.length).toEqual(2);
        });

        it("deletes cue at the end of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));

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

        it("updates editing cues", () => {
            // GIVEN
            const expectedCues = testingTrack.currentVersion ? testingTrack.currentVersion.cues : [];

            // WHEN
            testingStore.dispatch(updateEditingTrack(testingTrack));

            // THEN
            expect(testingStore.getState().cues).toEqual(expectedCues);
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
