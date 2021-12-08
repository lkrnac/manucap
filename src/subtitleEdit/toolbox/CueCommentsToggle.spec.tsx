import "../../testUtils/initBrowserEnvironment";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";
import { createTestingStore } from "../../testUtils/testingStore";
import CueCommentsToggle from "./CueCommentsToggle";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback
}));

let testingStore = createTestingStore();

describe("CueCommentsToggle", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="btn btn-secondary">
                <i className="fas fa-comments" /> Show Comments
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueCommentsToggle />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("changes icon/text on toggle", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="btn btn-secondary sbte-toggled-btn">
                <i className="fas fa-comment-slash" /> Hide Comments
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueCommentsToggle />
            </Provider>
        );
        fireEvent.click(actualNode.container.querySelector(".btn") as Element);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("toggles show comments in store on toggle", () => {
        // GIVEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueCommentsToggle />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".btn") as Element);

        // THEN
        expect(testingStore.getState().commentsVisible).toEqual(true);
    });
});
