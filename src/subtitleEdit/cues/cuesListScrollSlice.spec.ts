import testingStore from "../../testUtils/testingStore";
import { changeScrollPosition } from "./cuesListScrollSlice";
import { ScrollPosition } from "../model";
import { AnyAction } from "@reduxjs/toolkit";

describe("cuesListScrollSlice", () => {
    describe("changeScrollPosition", () => {
        it("updates scroll position in Redux store", () => {
            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.LAST);
        });
    });
});
