import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../../testUtils/testingStore";
import deepFreeze from "deep-freeze";
import { callSaveTrack, SaveState, saveStateSlice, setAutoSaveSuccess, setSaveTrack } from "./saveSlices";
import { updateEditingTrack } from "../trackSlices";
import { CueDto, Track } from "../model";
import { updateCueCategory, updateCues } from "./cueSlices";
import each from "jest-each";

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

// There are too many test cases === timing behaviors for using real debounce with 2.5s wait.
// Tests would be extremely slow. Therefore following trick which shortens wait debounce timeout to 50ms.
jest.mock("lodash", () => ({
    debounce: (callback: Function): Function =>
        // lodash API signature contains "any"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (...args: any[]): NodeJS.Timeout => setTimeout(() => callback(...args), 50)
}));

describe("saveSlices", () => {
    beforeEach(() => testingStore = createTestingStore());
    const saveTrack = jest.fn();
    const testingTrack = { mediaTitle: "testingTrack" } as Track;
    const testingCues = [
        { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "LYRICS", corrupted: false }
    ] as CueDto[];

    beforeEach(() => {
        // GIVEN
        saveTrack.mockReset();
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingCues[0].editUuid = testingStore.getState().cues[0].editUuid;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
    });

    describe("saveTrack", () => {
        beforeEach(() => {
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        });

        it("saves track after timeout when various cues changes were made", (done) => {
            // WHEN
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().saveState).toEqual(SaveState.TRIGGERED);
            setTimeout(
                () => {
                    expect(saveTrack).toHaveBeenCalledTimes(1);
                    expect(saveTrack).toBeCalledWith({ cues: testingCues, editingTrack: testingTrack });
                    expect(testingStore.getState().saveState).toEqual(SaveState.REQUEST_SENT);
                    done();
                },
                60
            );
        });

        it("sends latest version of track from Redux to server", (done) => {
            // GIVEN
            const expectedTestingCues = [
                { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "AUDIO_DESCRIPTION" }
            ] as CueDto[];

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
                20
            );

            // THEN
            expect(testingStore.getState().saveState).toEqual(SaveState.TRIGGERED);
            setTimeout(
                () => {
                    expect(saveTrack).toHaveBeenCalledTimes(1);
                    expect(saveTrack).toBeCalledWith({ cues: expectedTestingCues, editingTrack: testingTrack });
                    expect(testingStore.getState().saveState).toEqual(SaveState.REQUEST_SENT);
                    done();
                },
                60
            );
        });

        it("sends request to server after timeout", (done) => {
            // GIVEN
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);

            // WHEN
            setTimeout(
                () => {
                    // THEN
                    expect(testingStore.getState().saveState).toEqual(SaveState.REQUEST_SENT);
                    done();
                },
                60
            );
        });

        it("doesn't send request to server when previous request is still ongoing", (done) => {
            // GIVEN
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);
            setTimeout(() => saveTrack.mockReset(), 60);

            // WHEN
            setTimeout(
                () => testingStore.dispatch(callSaveTrack() as {} as AnyAction),
                70
            );

            // THEN
            setTimeout(
                () => {
                    expect(saveTrack).not.toBeCalled();
                    expect(testingStore.getState().saveState).toEqual(SaveState.RETRY);
                    done();
                },
                80
            );
        });
    });

    describe("setAutoSaveSuccess", () => {
        it("call doesn't fail if save track handler is not defined", () => {
            // GIVEN
            testingStore.dispatch(saveStateSlice.actions.setState(SaveState.RETRY) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

            // THEN - doesn't blow up with "State is not a function" error
        });

        it("retries save immediately in case of transition from RETRY state", () => {
            // GIVEN
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            testingStore.dispatch(saveStateSlice.actions.setState(SaveState.RETRY) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(saveTrack).toBeCalledWith({ cues: testingCues, editingTrack: testingTrack });
            expect(testingStore.getState().saveState).toEqual(SaveState.REQUEST_SENT);
        });

        each([
            [SaveState, SaveState.NONE],
            [SaveState, SaveState.TRIGGERED],
            [SaveState, SaveState.REQUEST_SENT],
            [SaveState, SaveState.SAVED],
            [SaveState, SaveState.ERROR],
        ])
            .it("marks save as succeeded from '%s' state", (testingState: SaveState) => {
                // GIVEN
                testingStore.dispatch(saveStateSlice.actions.setState(testingState) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().saveState).toEqual(SaveState.SAVED);
            });

        each([
            [SaveState, SaveState.NONE],
            [SaveState, SaveState.TRIGGERED],
            [SaveState, SaveState.REQUEST_SENT],
            [SaveState, SaveState.SAVED],
            [SaveState, SaveState.ERROR],
        ])
            .it("marks save as errored from '%s' state", (testingState: SaveState) => {
                // GIVEN
                testingStore.dispatch(saveStateSlice.actions.setState(testingState) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().saveState).toEqual(SaveState.SAVED);
            });
    });
});
