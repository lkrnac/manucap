import { createTestingStore } from "../testUtils/testingStore";
import deepFreeze from "deep-freeze";
import { AnyAction } from "@reduxjs/toolkit";
import { updateCues, updateSourceCues } from "./cues/cueSlices";

const testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("loadingIndicators", () => {
    it("Read initial loaded flags as false", () => {
        // THEN
        expect(testingStore.getState().loadingIndicator.cuesLoaded).toBeFalsy();
        expect(testingStore.getState().loadingIndicator.sourceCuesLoaded).toBeFalsy();
    });

    it("Sets cuesLoaded as true when updateCues is called", () => {
        //WHEN
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().loadingIndicator.cuesLoaded).toBeTruthy();
    });

    it("Sets sourceCuesLoaded as true when updateCues is called", () => {
        //WHEN
        testingStore.dispatch(updateSourceCues([]) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().loadingIndicator.sourceCuesLoaded).toBeTruthy();
    });
});
