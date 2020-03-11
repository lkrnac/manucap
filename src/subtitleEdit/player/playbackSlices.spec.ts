import { AnyAction } from "@reduxjs/toolkit";
import { changePlayerTime } from "./playbackSlices";
import testingStore from "../../testUtils/testingStore";

describe("playbackSlices", () => {
    describe("changePlayerTime", () => {
        it("configured new player time in redux", () => {
            // WHEN
            testingStore.dispatch(changePlayerTime(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().changePlayerTime).toEqual(1);
        });
    });
});