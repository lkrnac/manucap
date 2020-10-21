import testingStore from "../../testUtils/testingStore";
import { updateCues } from "./cuesListSlices";
import { AnyAction } from "@reduxjs/toolkit";

describe("cuesLoadCounterSlice", () => {
    it("initialize to 0", () => {
        // WHEN, THEN
        expect(testingStore.getState().cuesLoadingCounter)
            .toEqual(0);
    });

    it("update counter when call updateCues", () => {
        // WHEN
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().cuesLoadingCounter)
            .toEqual(1);
    });
});
