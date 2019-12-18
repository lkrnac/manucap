import "video.js"; // VTTCue definition
import {updateCue, updateEditingTrack, updateEditingTrackProgress} from "./trackSlices";
import testingStore from "../testUtils/testingStore";
import {Track, TrackDescription, TrackProgress} from "./model";

const testingTrack = {
    type: "CAPTION",
    language: {id: "en-US"},
    default: true,
    videoTitle: "This is the video title",
    projectName: "Project One",
    dueDate: "2019/12/30 10:00AM",
    description: {action: "Caption in", subject: "English (US)"} as TrackDescription,
    progress: {unit: "0/115 seconds", percentage: "0"} as TrackProgress,
    currentVersion: {
        cues: [
            new VTTCue(0, 1, "Caption Line 1"),
            new VTTCue(1, 2, "Caption Line 2"),
        ]
    }
} as Track;

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

        it("updates track progress", () => {
            // GIVEN
            const updatedProgress = { unit: "20/115 seconds", percentage: "25"} as TrackProgress;
            const expectedTrack = {
                type: "CAPTION",
                language: {id: "en-US"},
                default: true,
                videoTitle: "This is the video title",
                projectName: "Project One",
                dueDate: "2019/12/30 10:00AM",
                description: {action: "Caption in", subject: "English (US)"} as TrackDescription,
                progress: {unit: "20/115 seconds", percentage: "25"} as TrackProgress,
                currentVersion: {
                    cues: [
                        new VTTCue(0, 1, "Caption Line 1"),
                        new VTTCue(1, 2, "Caption Line 2"),
                    ]
                }
            } as Track;

            // WHEN
            testingStore.dispatch(updateEditingTrackProgress(updatedProgress));

            // THEN
            expect(testingStore.getState().editingTrack).toEqual(expectedTrack);
        });
    });
});
