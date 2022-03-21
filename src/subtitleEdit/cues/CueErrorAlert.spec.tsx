import "../../testUtils/initBrowserEnvironment";
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react";
import { CueError } from "../model";
import { createTestingStore } from "../../testUtils/testingStore";
import { setValidationErrors } from "./edit/cueEditorSlices";
import CueErrorAlert from "./CueErrorAlert";
import { act } from "react-dom/test-utils";

let testingStore = createTestingStore();

jest.setTimeout(15000);

describe("CueErrorAlert", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    it("shows cue errors alert when cue has validation errors", async () => {
        // GIVEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);

        const expectedNode = render(
            <div
                className="tw-alert tw-alert-component tw-alert-danger sbte-cue-errors-alert
                    tw-ease-out tw-duration-300 tw-opacity-0"
            >
                <button
                    className="tw-absolute tw-right-7 tw-top-3 tw-font-bold tw-text-red-900 tw-text-opacity-60
                        tw-text-sm tw-alert-close"
                >
                    <span aria-hidden>x</span>
                </button>
                <span>Unable to complete action due to the following error(s):</span><br />
                <div>&#8226; {CueError.LINE_CHAR_LIMIT_EXCEEDED}<br /></div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("closes cue errors alert if dismiss button is clicked", async () => {
        // GIVEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);
        const expectedNode = render(<></>);
        const { container } = render(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );

        // WHEN
        await fireEvent.click(container.querySelector("button.tw-alert-close") as HTMLElement);
        await act(async () => new Promise(resolve => setTimeout(resolve, 100)));

        // THEN
        expect(container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("closes cue errors alert automatically", async () => {
        // GIVEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);
        const expectedNode = render(<></>);
        const { container, rerender } = render(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 8100)));

        // WHEN
        rerender(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );

        // THEN
        expect(container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("closes cue errors alert automatically debounced", async () => {
        // GIVEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);
        const expectedNode = render(
            <div className="tw-alert tw-alert-component tw-alert-danger sbte-cue-errors-alert">
                <button
                    className="tw-absolute tw-right-7 tw-top-3 tw-font-bold tw-text-red-900 tw-text-opacity-60
                        tw-text-sm tw-alert-close"
                >
                    <span aria-hidden>x</span>
                </button>
                <span>Unable to complete action due to the following error(s):</span><br />
                <div>&#8226; {CueError.LINE_CHAR_LIMIT_EXCEEDED}<br /></div>
            </div>
        );
        const { container, rerender } = render(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );
        // debounce delay is 8 seconds, so change validation errors after 7 seconds, wait 4 seconds, then
        // ensure alert is still visible.
        await act(async () => new Promise(resolve => setTimeout(resolve, 7000)));
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);
        await act(async () => new Promise(resolve => setTimeout(resolve, 4000)));

        // WHEN
        rerender(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );

        // THEN
        expect(container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("auto sets validation error to false after receiving it", (done) => {
        // GIVEN
        render(
            <Provider store={testingStore} >
                <CueErrorAlert />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);

        // THEN
        setTimeout(() => {
            expect(testingStore.getState().validationErrors).toEqual([]);
            done();
        }, 1100);
    });
});
