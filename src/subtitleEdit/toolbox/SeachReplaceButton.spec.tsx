import "../../testUtils/initBrowserEnvironment";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import SearchReplaceButton from "./SearchReplaceButton";
import { fireEvent, render } from "@testing-library/react";
import MergeCuesButton from "./MergeCuesButton";
import { removeHeadlessAttributes } from "../../testUtils/testUtils";

let testingStore = createTestingStore();

describe("SeachReplaceButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <div
                id=""
                aria-expanded={false}
            >
                <button type="button" className="sbte-search-replace-button btn btn-secondary">
                    <i className="fas fa-search-plus fa-lg" />
                </button>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SearchReplaceButton />
            </Provider>
        );

        // THEN
        const actual = removeHeadlessAttributes(actualNode.container.outerHTML);
        const expected = removeHeadlessAttributes(expectedNode.container.outerHTML);
        expect(actual).toEqual(expected);
    });

    it("sets search replace visible on button click", () => {
        // GIVEN
        const { container } = render(
            <Provider store={testingStore}>
                <SearchReplaceButton />
            </Provider>
        );

        // WHEN
        fireEvent.click(container.querySelector(".sbte-search-replace-button") as Element);

        // THEN
        expect(testingStore.getState().searchReplaceVisible).toBeTruthy();
    });

    it("hides merge on button click", () => {
        // GIVEN
        const { container, getByText } = render(
            <Provider store={testingStore}>
                <SearchReplaceButton />
                <MergeCuesButton />
            </Provider>
        );
        const mergeButton = getByText("Merge Cues");
        const searchButton = container.querySelector(".sbte-search-replace-button") as Element;

        // WHEN
        fireEvent.click(mergeButton);
        fireEvent.click(searchButton);

        // THEN
        expect(testingStore.getState().mergeVisible).toBeFalsy();
    });
});
