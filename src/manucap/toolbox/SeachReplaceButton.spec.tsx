import "../../testUtils/initBrowserEnvironment";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import SearchReplaceButton from "./SearchReplaceButton";
import { fireEvent, render } from "@testing-library/react";
import MergeCuesButton from "./MergeCuesButton";
import { mdiFindReplace } from "@mdi/js";
import Icon from "@mdi/react";

let testingStore = createTestingStore();

describe("SeachReplaceButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button
                id="searchReplaceBtn"
                className="mc-search-replace-button mc-btn mc-btn-light"
                data-pr-tooltip="Search / Replace"
                data-pr-position="top"
                data-pr-at="center+2 top-2"
            >
                <Icon path={mdiFindReplace} size={1.25} />
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
        const { container } = render(
            <Provider store={testingStore}>
                <SearchReplaceButton />
            </Provider>
        );

        // WHEN
        fireEvent.click(container.querySelector(".mc-search-replace-button") as Element);

        // THEN
        expect(testingStore.getState().searchReplaceVisible).toBeTruthy();
    });

    it("hides merge on button click", () => {
        // GIVEN
        const { container, getByText } = render(
            <Provider store={testingStore}>
                <SearchReplaceButton />
                <MergeCuesButton onClick={jest.fn()} />
            </Provider>
        );
        const mergeButton = getByText("Merge Cues");
        const searchButton = container.querySelector(".mc-search-replace-button") as Element;

        // WHEN
        fireEvent.click(mergeButton);
        fireEvent.click(searchButton);

        // THEN
        expect(testingStore.getState().mergeVisible).toBeFalsy();
    });
});
