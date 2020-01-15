import "video.js"; // VTTCue definition
import { Task, Track } from "./model";
import {addCue, deleteCue, updateCue, updateEditingTrack, updateTask} from "./trackSlices";
import testingStore from "../testUtils/testingStore";

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
    videoTitle: "This is the video title",
    currentVersion: {
        cues: [
            new VTTCue(0, 1, "Caption Line 1"),
            new VTTCue(1, 2, "Caption Line 2"),
        ]
    }
} as Track;

const testingTask = {
    type: "TASK_CAPTION",
    projectName: "Project One",
    dueDate: "2019/12/30 10:00AM"
} as Task;

describe("trackSlices", () => {
    describe("updateCue", () => {
        it("updates top level cues", () => {
            // WHEN
            testingStore.dispatch(updateCue(3, new VTTCue(1, 2, "Dummy Cue")));

            // THEN
            expect(testingStore.getState().cues[3]).toEqual(new VTTCue(1, 2, "Dummy Cue"));
        });

        it("updates cues in editing track", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));

            // WHEN
            testingStore.dispatch(updateCue(1, new VTTCue(1, 2, "Dummy Cue")));

            // THEN
            // @ts-ignore - Test will fail if version is null
            expect(testingStore.getState().editingTrack.currentVersion.cues[1]).toEqual(new VTTCue(1, 2, "Dummy Cue"));
        });
    });

    describe("addCue", () => {
        it("adds cue to the end of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));

            // WHEN
            testingStore.dispatch(addCue(2, new VTTCue(2, 3, "Dummy Cue End")));

            // THEN
            expect(testingStore.getState().cues[1]).toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().cues[2]).toEqual(new VTTCue(2, 3, "Dummy Cue End"));
        });

        it("add cue in middle of cue array cues in editing track", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));

            // WHEN
            testingStore.dispatch(addCue(1, new VTTCue(0.5, 1, "Dummy Cue Insert")));

            // THEN
            expect(testingStore.getState().cues[1]).toEqual(new VTTCue(0.5, 1, "Dummy Cue Insert"));
            expect(testingStore.getState().cues[2]).toEqual(new VTTCue(1, 2, "Caption Line 2"));
        });
    });

    describe("deleteCue", () => {
        it("deletes cue at the beginning of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));

            // WHEN
            testingStore.dispatch(deleteCue(   0));

            // THEN
            expect(testingStore.getState().cues[0]).toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(1);
        });

        it("deletes cue in the middle of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));
            testingStore.dispatch(addCue(1, new VTTCue(0.5, 1, "Dummy Cue Insert")));

            // WHEN
            testingStore.dispatch(deleteCue(   1));

            // THEN
            expect(testingStore.getState().cues[0]).toEqual(new VTTCue(0, 1, "Caption Line 1"));
            expect(testingStore.getState().cues[1]).toEqual(new VTTCue(1, 2, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(2);
        });

        it("deletes cue at the end of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack));

            // WHEN
            testingStore.dispatch(deleteCue(   1));

            // THEN
            expect(testingStore.getState().cues[0]).toEqual(new VTTCue(0, 1, "Caption Line 1"));
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
