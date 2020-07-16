import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../../testUtils/testingStore";
import deepFreeze from "deep-freeze";
import { callSaveTrack, setAutoSaveSuccess, setSaveTrack } from "./saveSlices";
import { resetEditingTrack, updateEditingTrack } from "../trackSlices";
import { CueDto, Track } from "../model";
import { Constants } from "../constants";
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
        });

        it("debounces saveTrack call", () => {
            // WHEN
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
        });

        it("calls saveTrack if previous call failed", () => {
            // WHEN
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);
            testingStore.dispatch(setAutoSaveSuccess(false) as {} as AnyAction);

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(2);
        });

        it("calls saveTrack if there's a pending call", (done) => {
            // WHEN
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);

            setTimeout(() => {
                // THEN
                testingStore.dispatch(callSaveTrack() as {} as AnyAction);
                testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

                expect(saveTrack).toHaveBeenCalledTimes(2);
                done();
            }, 300);
        });

        it("passes cues and editingTrack from store to call to saveTrack", (done) => {
            // WHEN
            const cues = testingStore.getState().cues;
            const editingTrack = testingStore.getState().editingTrack;
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);

            setTimeout(() => {
                // THEN
                expect(saveTrack).toHaveBeenCalledTimes(1);
                expect(saveTrack).toHaveBeenCalledWith({ cues, editingTrack });
                done();
            }, 300);
        });
    });

    describe("autoSaveSuccessSlice", () => {
        it("sets the autoSave success flag to false", () => {
            // WHEN
            testingStore.dispatch(setAutoSaveSuccess(false) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().autoSaveSuccess).toEqual(false);
        });
        it("sets the autoSave success flag to true", () => {
            // WHEN
            testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().autoSaveSuccess).toEqual(true);
        });
        it("does not set the autoSave success flag to true if saveTrack is unmounted", () => {
            // GIVEN
            testingStore.dispatch(resetEditingTrack() as {} as AnyAction);

            // WHEN
            testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().autoSaveSuccess).toEqual(false);
        });
    });

    describe("saveStatus", () => {
        it("sets save status when saveTrack is called", () => {
            // WHEN
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().saveStatus).toEqual(Constants.AUTO_SAVE_SAVING_CHANGES_MSG);
        });
        it("sets save status after successful save", () => {
            // WHEN
            testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().saveStatus).toEqual(Constants.AUTO_SAVE_SUCCESS_CHANGES_SAVED_MSG);
        });
        it("sets save status after failed save", () => {
            // WHEN
            testingStore.dispatch(setAutoSaveSuccess(false) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().saveStatus).toEqual(Constants.AUTO_SAVE_ERROR_SAVING_MSG);
        });
    });
});
