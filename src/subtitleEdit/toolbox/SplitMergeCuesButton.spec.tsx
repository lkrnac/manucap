import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";
import SplitMergeCuesButton from "./SplitMergeCuesButton";

let testingStore = createTestingStore();

describe("SplitMergeCuesButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="btn btn-secondary sbte-split-merge-cues-button">
                <i className="fas fa-cut" /> Split/Merge Cues
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SplitMergeCuesButton />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("sets split/merge visible on button click", () => {
        // GIVEN
        const { getByText } = render(
            <Provider store={testingStore}>
                <SplitMergeCuesButton />
            </Provider>
        );
        const splitMergeButton = getByText("Split/Merge Cues");

        // WHEN
        fireEvent.click(splitMergeButton);

        // THEN
        expect(testingStore.getState().splitMergeVisible).toBeTruthy();
    });
});
