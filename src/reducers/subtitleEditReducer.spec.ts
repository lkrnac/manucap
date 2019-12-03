import subtitleEditReducers from "./subtitleEditReducer";

const initialState = {
    testReducer: { testValue: "initialValue" }
};

describe("subtitleEditReducer", () => {
    it("combines state for test reducer", () => {
        // GIVEN

        // WHEN
        const actualState = subtitleEditReducers(initialState, { type: "TEST_ACTION", testValue: "someValue" });

        // THEN
        expect(actualState.testReducer).toEqual({ testValue: "someValue" });
    });
});