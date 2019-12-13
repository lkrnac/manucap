import "video.js"; // VTTCue definition
import {updateCue, updateEditingTrack} from "./trackSlices";
import testingStore from "../testUtils/testingStore";
import {Track} from "./model";

const testingTrack = {
    type: "CAPTION",
    language: {id: "en-US"},
    default: true,
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
});