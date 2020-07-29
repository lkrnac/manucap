import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../../testUtils/testingStore";
import deepFreeze from "deep-freeze";
import { callSaveTrack, SaveState, setAutoSaveSuccess, setSaveTrack } from "./saveSlices";
import { updateEditingTrack } from "../trackSlices";
import { CueDto, Track } from "../model";
import { updateCues } from "./cueSlices";

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback
}));

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
        it("calls saveTrack", () => {
            // GIVEN
            const testingCues = [
                { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "LYRICS", corrupted: false }
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingCues[0].editUuid = testingStore.getState().cues[0].editUuid;

            // WHEN
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(saveTrack).toBeCalledWith({ cues: testingCues, editingTrack: testingTrack });
            expect(testingStore.getState().saveState).toEqual(SaveState.REQUEST_SENT);
        });
    });

    describe("setAutoSaveSuccess", () => {
        it("calls saveTrack", () => {
            // GIVEN
            const testingCues = [
                { vttCue: new VTTCue(0, 1, "testing-cue"), cueCategory: "LYRICS", corrupted: false }
            ] as CueDto[];
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingCues[0].editUuid = testingStore.getState().cues[0].editUuid;
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);

            // WHEN
            testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(saveTrack).toBeCalledWith({ cues: testingCues, editingTrack: testingTrack });
            expect(testingStore.getState().saveState).toEqual(SaveState.SAVED);
        });
    });
});
