import "../../testUtils/initBrowserEnvironment";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";
import { createTestingStore } from "../../testUtils/testingStore";
import TimecodesLockToggle from "./TimecodesLockToggle";
import { Track } from "../model";
import { updateEditingTrack } from "../trackSlices";
import { AnyAction } from "@reduxjs/toolkit";

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
            <button type="button" className="tw-dropdown-item tw-flex tw-items-center tw-justify-between">
                Timecodes <span className="tw-badge tw-badge-sm tw-badge-secondary">LOCKED</span>
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
            <button
                type="button"
                className="tw-dropdown-item tw-flex tw-items-center tw-justify-between sbte-toggled-btn"
            >
                Timecodes <span className="tw-badge tw-badge-sm tw-badge-success">UNLOCKED</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <TimecodesLockToggle />
            </Provider>
        );

        fireEvent.click(actualNode.container.querySelector(".tw-dropdown-item") as Element);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("toggles timecodes lock in store on toggle", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US" },
            default: true,
            timecodesUnlocked: false
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <TimecodesLockToggle />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".tw-dropdown-item") as Element);

        // THEN
        expect(testingStore.getState().editingTrack.timecodesUnlocked).toEqual(true);
    });
});
