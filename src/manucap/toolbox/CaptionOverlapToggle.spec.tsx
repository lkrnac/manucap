import "../../testUtils/initBrowserEnvironment";
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react";
import Icon from "@mdi/react";
import { mdiSetCenter } from "@mdi/js";

import { Track } from "../model";
import CaptionOverlapToggle from "./CaptionOverlapToggle";
import { createTestingStore } from "../../testUtils/testingStore";
import { updateEditingTrack } from "../trackSlices";
import { setSaveTrack } from "../cues/saveSlices";

let testingStore = createTestingStore();

describe("CaptionOverlapToggle", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
    const saveTrack = jest.fn();
    beforeEach(() => {
        // GIVEN
        saveTrack.mockReset();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        jest.resetAllMocks();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="flex items-center justify-between">
                <span className="flex items-center">
                    <Icon path={mdiSetCenter} size={1.25} />
                    <span className="pl-4">Overlapping</span>
                </span>
                <span className="mc-badge font-medium mc-badge-sm mc-badge-secondary">
                    NOT ALLOWED
                </span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionOverlapToggle onClick={jest.fn()} saveState="NONE" />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("changes icon on toggle", () => {
        // GIVEN
        const expectedNode = render(
            <button
                type="button"
                className="flex items-center justify-between outline-0 active"
            >
                <span className="flex items-center">
                    <Icon path={mdiSetCenter} size={1.25} />
                    <span className="pl-4">Overlapping</span>
                </span>
                <span className="mc-badge font-medium mc-badge-sm mc-badge-success">ALLOWED</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionOverlapToggle onClick={jest.fn()} saveState="NONE" />
            </Provider>
        );
        fireEvent.click(actualNode.container.querySelector("button") as Element);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("changes icon back on double toggle", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US" },
            default: true,
            overlapEnabled: false
        } as Track;

        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        const expectedNode = render(
            <button type="button" className="flex items-center justify-between">
                <span className="flex items-center">
                    <Icon path={mdiSetCenter} size={1.25} />
                    <span className="pl-4">Overlapping</span>
                </span>
                <span className="mc-badge font-medium mc-badge-sm mc-badge-secondary">
                    NOT ALLOWED
                </span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionOverlapToggle onClick={jest.fn()} saveState="NONE" />
            </Provider>
        );

        fireEvent.click(actualNode.container.querySelector("button") as Element);
        fireEvent.click(actualNode.container.querySelector("button") as Element);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("toggles overlap caption flag in store on toggle", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US" },
            default: true,
            overlapEnabled: false
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionOverlapToggle onClick={jest.fn()} saveState="NONE" />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector("button") as Element);

        // THEN
        expect(testingStore.getState().editingTrack.overlapEnabled).toEqual(true);
    });

    it("disables button while saving", () => {
        // GIVEN
        const testingTrack = { type: "CAPTION", language: { id: "en-US" }, default: true } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionOverlapToggle onClick={jest.fn()} saveState="TRIGGERED" />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector("button") as Element).toBeDisabled();
    });

    it("enables button after successful save", () => {
        // GIVEN
        const testingTrack = { type: "CAPTION", language: { id: "en-US" }, default: true } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionOverlapToggle onClick={jest.fn()} saveState="SAVED" />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector("button") as Element).toBeEnabled();
    });

    it("enables button after failed save", () => {
        // GIVEN
        const testingTrack = { type: "CAPTION", language: { id: "en-US" }, default: true } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionOverlapToggle onClick={jest.fn()} saveState="ERROR" />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector("button") as Element).toBeEnabled();
    });
});
