import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../../testUtils/testingStore";
import deepFreeze from "deep-freeze";
import { callSaveTrack, setSaveTrack } from "./saveSlices";
import { updateEditingTrack } from "../trackSlices";
import { CueDto, Track } from "../model";
import { updateCueCategory, updateCues } from "./cueSlices";

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("saveSlices", () => {
    beforeEach(() => testingStore = createTestingStore());
    const saveTrack = jest.fn();
    const testingTrack = { mediaTitle: "testingTrack" } as Track;

    beforeEach(() => {
        // GIVEN
        saveTrack.mockReset();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
    });

    describe("saveTrack", () => {
        it("saves track after timeout after various cues changes", (done) => {
            // GIVEN
            const testingCues = [
                { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "LYRICS", corrupted: false }
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingCues[0].editUuid = testingStore.getState().cues[0].editUuid;

            // WHEN
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);

            // THEN
            setTimeout(
                () => {
                    expect(saveTrack).toHaveBeenCalledTimes(1);
                    expect(saveTrack).toBeCalledWith({ cues: testingCues, editingTrack: testingTrack });
                    done();
                },
                2600
            );
        });

        it("saves latest version of track after timeout after triggering it", (done) => {
            // GIVEN
            const testingCues = [
                { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "LYRICS", corrupted: false }
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingCues[0].editUuid = testingStore.getState().cues[0].editUuid;
            const expectedTestingCues = [
                { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "AUDIO_DESCRIPTION", "corrupted": false }
            ] as CueDto[];
            expectedTestingCues[0].editUuid = testingStore.getState().cues[0].editUuid;

            // WHEN
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);
            setTimeout(
                () => {
                    testingStore.dispatch(
                        updateCueCategory(
                            0,
                            "AUDIO_DESCRIPTION"
                        ) as {} as AnyAction
                    );
                },
                500
            );

            // THEN
            setTimeout(
                () => {
                    expect(saveTrack).toHaveBeenCalledTimes(1);
                    expect(saveTrack).toBeCalledWith({ cues: expectedTestingCues, editingTrack: testingTrack });
                    done();
                },
                2600
            );
        });
    });
});
