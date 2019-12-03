import testReducer from "./testReducer";

import deepFreeze from "deep-freeze";

const initialState = {
    testValue: "initialTestValue"
};

deepFreeze(initialState);

describe("testReducer", () => {
    it("returns initial state for non-existing action type", () => {
        // WHEN
        const actualState = testReducer(undefined, { type: "NON-EXISTENT", testValue: "newTestValue" });

        // THEN
        expect(actualState).toEqual(initialState);
    });

    it("updates test value for testing action and undefined state", () => {
        // WHEN
        const actualState = testReducer(undefined, { type: "TEST_ACTION", testValue: "newTestValue" });

        // THEN
        expect(actualState).toEqual({ testValue: "newTestValue" });
    });

    it("updates test value for testing action and existing state", () => {
        // WHEN
        const actualState = testReducer(initialState, { type: "TEST_ACTION", testValue: "newTestValue" });

        // THEN
        expect(actualState).toEqual({ testValue: "newTestValue" });
    });
});