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
            <button type="button" className="tw-flex tw-items-center tw-justify-between">
                Timecodes <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-secondary">LOCKED</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <TimecodesLockToggle onClick={jest.fn()} />
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
                className="tw-flex tw-items-center tw-justify-between tw-outline-0"
            >
                Timecodes <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-success">UNLOCKED</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <TimecodesLockToggle onClick={jest.fn()} />
            </Provider>
        );

        fireEvent.click(actualNode.container.querySelector("button") as Element);

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
                <TimecodesLockToggle onClick={jest.fn()} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector("button") as Element);

        // THEN
        expect(testingStore.getState().editingTrack.timecodesUnlocked).toEqual(true);
    });
});
