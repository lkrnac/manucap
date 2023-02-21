import { AnyAction } from "@reduxjs/toolkit";
import deepFreeze from "deep-freeze";

import { createTestingStore } from "../../testUtils/testingStore";
import { callSaveTrack, setSaveTrack } from "./saveSlices";
import { updateEditingTrack } from "../trackSlices";
import { CueDto, Track } from "../model";
import { updateCueCategory, updateCues } from "./cuesList/cuesListActions";

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

// There are too many test cases === timing behaviors for using real debounce with 2.5s wait.
// Tests would be extremely slow. Therefore following trick which shortens wait debounce timeout to 50ms.
jest.mock("lodash", () => ({
    debounce: (callback: Function): Function =>
        // lodash API signature contains "any"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (...args: any[]): NodeJS.Timeout => setTimeout(() => callback(...args), 50),
    sortBy: jest.requireActual("lodash/sortBy"),
    findIndex: jest.requireActual("lodash/findIndex")
}));

const saveTrack = jest.fn();
const testingTrack = { mediaTitle: "testingTrack", timecodesUnlocked: true } as Track;
const testingCues = [
    { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "LYRICS" }
] as CueDto[];

describe("saveSlices", () => {
    describe("saveTrack", () => {
        beforeEach(() => {
            testingStore = createTestingStore();
            saveTrack.mockReset();
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        });

        it("sends latest version of track from Redux to server", (done) => {
            // GIVEN
            const expectedTestingCues = [
                { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "AUDIO_DESCRIPTION" }
            ] as CueDto[];
            callSaveTrack(testingStore.dispatch, testingStore.getState);
            expectedTestingCues[0].editUuid = testingStore.getState().cues[0].editUuid;

            // WHEN
            setTimeout(
                () => {
                    testingStore.dispatch(
                        updateCueCategory(
                            0,
                            "AUDIO_DESCRIPTION"
                        ) as {} as AnyAction
                    );
                },
                20
            );

            // THEN
            setTimeout(
                () => {
                    expect(saveTrack).toHaveBeenCalledTimes(1);
                    expect(saveTrack).toBeCalledWith(
                        { cues: expectedTestingCues, editingTrack: testingTrack, shouldCreateNewVersion: true  }
                    );
                    done();
                },
                60
            );
        });

        it("sends request to server after timeout", (done) => {
            // GIVEN
            callSaveTrack(testingStore.dispatch, testingStore.getState);

            // WHEN
            setTimeout(
                () => {
                    // THEN
                    expect(saveTrack).toHaveBeenCalledTimes(1);
                    done();
                },
                60
            );
        });
    });
});
