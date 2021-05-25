import "../../testUtils/initBrowserEnvironment";
import React  from "react";
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react";
import { CueError } from "../model";
import { createTestingStore } from "../../testUtils/testingStore";
import { reset } from "./edit/editorStatesSlice";
import { setValidationErrors } from "./edit/cueEditorSlices";
import { Alert } from "react-bootstrap";
import CueErrorAlert from "./CueErrorAlert";
import { act } from "react-dom/test-utils";

let testingStore = createTestingStore();

jest.setTimeout(12000);

describe("CueErrorAlert", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(reset() as {} as AnyAction);
    });

    it("shows cue errors alert when cue has validation errors", async () => {
        // GIVEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);

        const expectedNode = render(
            <Alert key="cueErrorsAlert" variant="danger" className="sbte-cue-errors-alert" dismissible show>
                <span>Unable to complete action due to the following error(s):</span><br />
                <div>&#8226; {CueError.LINE_CHAR_LIMIT_EXCEEDED}<br /></div>
            </Alert>
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
        await fireEvent.click(container.querySelector("button.close") as HTMLElement);
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
            <Alert key="cueErrorsAlert" variant="danger" className="sbte-cue-errors-alert" dismissible show>
                <span>Unable to complete action due to the following error(s):</span><br />
                <div>&#8226; {CueError.LINE_CHAR_LIMIT_EXCEEDED}<br /></div>
            </Alert>
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
});
