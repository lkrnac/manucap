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

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("saveTrack", () => {
    beforeEach(() => testingStore = createTestingStore());

    const saveTrack = jest.fn();

    beforeAll(() => {
        // @ts-ignore
        jest.spyOn(_, "debounce").mockReturnValue(() => { saveTrack(); });
    });

    beforeEach(() => {
        // GIVEN
        saveTrack.mockReset();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
    });

    it("calls saveTrack", () => {
        // WHEN
        testingStore.dispatch(callSaveTrack() as {} as AnyAction);

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });

    it("doesn't call saveTrack again if there's a pending call", () => {
        // WHEN
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
        // WHEN
        testingStore.dispatch(callSaveTrack() as {} as AnyAction);

        // THEN
        expect(testingStore.getState().saveStatus).toEqual(SAVING_CHANGES_MSG);
    });
    it("sets save status after successful save", () => {
        // WHEN
        testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().saveStatus).toEqual(CHANGES_SAVED_MSG);
    });
    it("sets save status after failed save", () => {
        // WHEN
        testingStore.dispatch(setAutoSaveSuccess(false) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().saveStatus).toEqual(ERROR_SAVING_MSG);
    });
});
