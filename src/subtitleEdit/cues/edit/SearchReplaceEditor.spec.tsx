import "../../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount } from "enzyme";
import SearchReplaceEditor from "./SearchReplaceEditor";
import testingStore from "../../../testUtils/testingStore";
import { Provider } from "react-redux";
import { showSearchReplace } from "./searchReplaceSlices";
import {AnyAction} from "@reduxjs/toolkit";

describe("SearchReplace", () => {
    it("renders", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const expectedNode = mount(
            <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
                <div style={{display: "flex", flexFlow: "row", width: "50%"}}>
                    <input type="text" value="" placeholder="Find" className="form-control" />
                    <input
                        type="text" value="" placeholder="Replace" className="form-control" style={{marginLeft: "5px"}}
                    />
                </div>
                <button className="btn btn-secondary btn-sm" type="button" style={{ marginLeft: "5px" }}>
                    <i className="fa fa-arrow-down" />
                </button>
                <button className="btn btn-secondary btn-sm" type="button" style={{ marginLeft: "5px" }}>
                    <i className="fa fa-arrow-up" />
                </button>
                <button className="btn btn-secondary btn-sm" type="button" style={{ marginLeft: "5px" }}>
                    Replace
                </button>
                <button className="btn btn-secondary btn-sm" type="button" style={{ marginLeft: "5px" }}>
                    Replace All
                </button>
                <span style={{ flex: 1 }} />
                <button
                    className="btn btn-secondary btn-sm sbte-close-search-replace-btn"
                    type="button"
                    style={{ marginLeft: "5px" }}
                >
                    <i className="fa fa-window-close" />
                </button>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("does not render of show is false", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(false) as {} as AnyAction);

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual("");
    });

    it("set show search replace to false when close button is clicked", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-close-search-replace-btn").simulate("click");

        // THEN
        expect(testingStore.getState().searchReplaceVisible).toBeFalsy();
    });
});
