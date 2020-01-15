import "../testUtils/initBrowserEnvironment";
import AddCueLineButton from "./AddCueLineButton";
import React from "react";
import { mount } from "enzyme";
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";

/**
 * On click actions are covered by CueTextEditor tests
 */
describe("AddCueLineButton", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <button className="btn btn-outline-secondary sbte-add-cue-button">
                <b>+</b>
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} cueEndTime={1} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
});
