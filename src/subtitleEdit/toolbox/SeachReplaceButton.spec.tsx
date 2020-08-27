import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount, shallow } from "enzyme";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import SearchReplaceButton from "./SearchReplaceButton";

let testingStore = createTestingStore();

describe("SeachReplaceButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = shallow(
            <button type="button" className="sbte-search-replace-button btn btn-secondary">
                <i className="fas fa-search-plus" /> Search/Replace
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SearchReplaceButton />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("sets search replace visible on button click", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SearchReplaceButton />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-search-replace-button").simulate("click");

        // THEN
        expect(testingStore.getState().searchReplaceVisible).toBeTruthy();
    });
});
