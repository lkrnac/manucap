import "../../../testUtils/initBrowserEnvironment";
import DeleteCueLineButton from "./DeleteCueLineButton";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";

/**
 * On click actions are covered by CueTextEditor tests
 */
describe("DeleteCueLineButton", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <button className="btn btn-outline-secondary sbte-delete-cue-button">
                <i className="fas fa-trash-alt" />
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <DeleteCueLineButton cueIndex={0} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
});
