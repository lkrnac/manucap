import "../../testUtils/initBrowserEnvironment";
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { CueError } from "../model";
import { createTestingStore } from "../../testUtils/testingStore";
import { setValidationErrors } from "./edit/cueEditorSlices";
import CueErrorAlert from "./CueErrorAlert";
import { act } from "react-dom/test-utils";
import React from "react";

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
            <div className="p-toast p-component p-toast-top-center">
                <div>
                    <div
                        className="p-toast-message p-toast-message-error"
                        role="alert"
                        aria-live="assertive"
                        aria-atomic="true"
                    >
                        <div className="p-toast-message-content">
                            <span className="p-toast-message-icon pi pi-times" />
                            <div className="p-toast-message-text">
                                <span className="p-toast-summary">
                                    Unable to complete action due to the following error(s):
                                </span>
                                <div className="p-toast-detail">
                                    Max Characters Per Line Exceeded
                                </div>
                            </div>
                            <button type="button" className="p-toast-icon-close p-link">
                                <span className="p-toast-icon-close-icon pi pi-times" />
                            </button>
                        </div>
                    </div>
                </div>
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

        const expectedNode = render(
            <>
                <div className="p-toast p-component p-toast-top-center">
                    <div />
                </div>
            </>
        );

        const { container } = render(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );

        // WHEN
        await fireEvent.click(container.querySelector("button.p-toast-icon-close") as HTMLElement);

        // THEN
        await waitFor(() => {
            expect(container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });
    });

    it("closes cue errors alert automatically", async () => {
        // GIVEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);

        const expectedNode = render(
            <>
                <div className="p-toast p-component p-toast-top-center">
                    <div />
                </div>
            </>
        );

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
        await waitFor(() => {
            expect(container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });
    });

    it("closes cue errors alert automatically debounced", async () => {
        // GIVEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);
        const expectedNode = render(
            <div className="p-toast p-component p-toast-top-center">
                <div>
                    <div
                        className="p-toast-message p-toast-message-error p-toast-message-enter-done"
                        role="alert"
                        aria-live="assertive"
                        aria-atomic="true"
                    >
                        <div className="p-toast-message-content">
                            <span className="p-toast-message-icon pi pi-times" />
                            <div className="p-toast-message-text">
                                <span className="p-toast-summary">
                                    Unable to complete action due to the following error(s):
                                </span>
                                <div className="p-toast-detail">
                                    Max Characters Per Line Exceeded
                                </div>
                            </div>
                            <button type="button" className="p-toast-icon-close p-link">
                                <span className="p-toast-icon-close-icon pi pi-times" />
                            </button>
                        </div>
                    </div>
                </div>
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

    it("clears calls toast clear", async () => {
        // GIVEN
        const clearMock = jest.fn();
        const toastClearSpy = jest.spyOn(React, "useRef").mockReturnValueOnce({ current: { clear: clearMock }});
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);


        // WHEN
        render(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );

        // THEN
        expect(clearMock).toBeCalled();

    });
});
