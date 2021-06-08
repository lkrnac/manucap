import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";
import MergeCuesButton from "./MergeCuesButton";

let testingStore = createTestingStore();

describe("MergeCuesButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="btn btn-secondary sbte-merge-cues-button">
                <i className="fas fa-cut" /> Merge Cues
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <MergeCuesButton />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("sets merge visible on button click", () => {
        // GIVEN
        const { getByText } = render(
            <Provider store={testingStore}>
                <MergeCuesButton />
            </Provider>
        );
        const mergeButton = getByText("Merge Cues");

        // WHEN
        fireEvent.click(mergeButton);

        // THEN
        expect(testingStore.getState().mergeVisible).toBeTruthy();
    });
});
