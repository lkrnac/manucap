import _ from "lodash";
import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../../testUtils/testingStore";
import deepFreeze from "deep-freeze";
import {
    callSaveTrack,
    CHANGES_SAVED_MSG,
    ERROR_SAVING_MSG,
    SAVING_CHANGES_MSG,
    setAutoSaveSuccess,
    setSaveTrack
} from "./saveSlices";
import { updateEditingTrack } from "../trackSlices";
import { Track } from "../model";

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("saveSlices", () => {
    describe("saveTrack", () => {
        beforeEach(() => testingStore = createTestingStore());

        const saveTrack = jest.fn();

        beforeAll(() => {
            // @ts-ignore
            jest.spyOn(_, "debounce").mockReturnValue((cues) => { saveTrack(cues); });
        });

        beforeEach(() => {
            // GIVEN
            saveTrack.mockReset();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);
        });

        it("calls saveTrack", () => {
            // WHEN
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
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

                expect(saveTrack).toHaveBeenCalledTimes(1);
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
    });

    describe("saveStatus", () => {
        it("sets save status when saveTrack is called", () => {
            //GIVEN
            const expectedStatus = { "message": SAVING_CHANGES_MSG, "pendingChanges": true };

            // WHEN
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().saveStatus).toEqual(expectedStatus);
        });
        it("sets save status after successful save", () => {
            //GIVEN
            const expectedStatus = { "message": CHANGES_SAVED_MSG, "pendingChanges": false };

            // WHEN
            testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().saveStatus).toEqual(expectedStatus);
        });
        it("sets save status after failed save", () => {
            //GIVEN
            const expectedStatus = { "message": ERROR_SAVING_MSG, "pendingChanges": false };

            // WHEN
            testingStore.dispatch(setAutoSaveSuccess(false) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().saveStatus).toEqual(expectedStatus);
        });
    });
});
