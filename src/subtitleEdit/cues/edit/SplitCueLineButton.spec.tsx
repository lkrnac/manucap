/**  * @jest-environment jsdom-sixteen  */
// TODO Remove above when we update to react-scripts with Jest 26:
// https://github.com/facebook/create-react-app/pull/8362
// eslint-disable-next-line
// https://stackoverflow.com/questions/61036156/react-typescript-testing-typeerror-mutationobserver-is-not-a-constructor#comment110029314_61039444

import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { Provider } from "react-redux";
import React from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";

import SplitCueLineButton from "./SplitCueLineButton";
import { Track } from "../../model";
import { createTestingStore } from "../../../testUtils/testingStore";
import { updateEditingTrack } from "../../trackSlices";

let testingStore = createTestingStore();
const testTrack = { mediaTitle: "testingTrack", language: { id: "en-US", name: "English", direction: "LTR" }};

describe("SplitCueLineButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button
                style={{ maxHeight: "38px", margin: "5px" }}
                className="btn btn-outline-secondary sbte-split-cue-button"
            >
                <i className="fas fa-cut" />
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SplitCueLineButton cueIndex={0} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });
});
