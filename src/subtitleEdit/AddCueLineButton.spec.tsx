import "../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import AddCueLineButton from "./AddCueLineButton";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import testingStore from "../testUtils/testingStore";

/**
 * On click actions are covered by CueTextEditor tests
 */
describe("AddCueLineButton", () => {
    it("renders", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "");
        const expectedNode = mount(
            <button className="btn btn-outline-secondary sbte-add-cue-button">
                <b>+</b>
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} vttCue={vttCue} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
});
