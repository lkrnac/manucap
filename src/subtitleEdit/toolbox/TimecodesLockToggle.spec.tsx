import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";
import { createTestingStore } from "../../testUtils/testingStore";
import TimecodesLockToggle from "./TimecodesLockToggle";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback
}));

let testingStore = createTestingStore();

describe("TimecodesLockToggle", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="btn btn-secondary">
                <><i className="fas fa-clock" /> Unlock Timecodes</>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <TimecodesLockToggle />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("changes icon/text on toggle", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="btn btn-secondary sbte-toggled-btn">
                <><i className="far fa-clock" /> Lock Timecodes</>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <TimecodesLockToggle />
            </Provider>
        );
        fireEvent.click(actualNode.container.querySelector(".btn") as Element);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("toggles timecodes lock in store on toggle", () => {
        // GIVEN
        const actualNode = render(
            <Provider store={testingStore}>
                <TimecodesLockToggle />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".btn") as Element);

        // THEN
        expect(testingStore.getState().timecodesUnlocked).toEqual(true);
    });
});
