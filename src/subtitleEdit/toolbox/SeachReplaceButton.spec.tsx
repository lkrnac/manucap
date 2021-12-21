import "../../testUtils/initBrowserEnvironment";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import SearchReplaceButton from "./SearchReplaceButton";
import { fireEvent, render } from "@testing-library/react";
import MergeCuesButton from "./MergeCuesButton";

let testingStore = createTestingStore();

describe("SeachReplaceButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="sbte-search-replace-button btn btn-secondary">
                <i className="fas fa-search-plus" /> Search/Replace
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SearchReplaceButton />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("sets search replace visible on button click", () => {
        // GIVEN
        const { getByText } = render(
            <Provider store={testingStore}>
                <SearchReplaceButton />
            </Provider>
        );
        const searchButton = getByText("Search/Replace");

        // WHEN
        fireEvent.click(searchButton);

        // THEN
        expect(testingStore.getState().searchReplaceVisible).toBeTruthy();
    });

    it("hides merge on button click", () => {
        // GIVEN
        const { getByText } = render(
            <Provider store={testingStore}>
                <SearchReplaceButton />
                <MergeCuesButton />
            </Provider>
        );
        const mergeButton = getByText("Merge Cues");
        const searchButton = getByText("Search/Replace");

        // WHEN
        fireEvent.click(mergeButton);
        fireEvent.click(searchButton);

        // THEN
        expect(testingStore.getState().mergeVisible).toBeFalsy();
    });
});
