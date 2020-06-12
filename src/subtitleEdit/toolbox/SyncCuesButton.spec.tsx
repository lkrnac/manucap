import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount, shallow } from "enzyme";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import SyncCuesButton from "./SyncCuesButton";

let testingStore = createTestingStore();

describe("SyncCuesButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
    it("renders", () => {
        // GIVEN
        const expectedNode = shallow(
            <button type="button" className="sbte-export-button btn btn-secondary">
                <i className="fas fa-sync" /> Sync Cues
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SyncCuesButton />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

});
