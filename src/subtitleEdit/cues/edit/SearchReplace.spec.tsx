import "../../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount } from "enzyme";
import SearchReplace from "./SearchReplace";
import testingStore from "../../../testUtils/testingStore";
import { Provider } from "react-redux";

describe("SearchReplace", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <div style={{ display: "flex", flexFlow: "row" }}>
                <input name="findTerm" type="text" value="" />
                <input name="replacementTerm" type="text" value="" />
                <button className="btn btn-secondary" type="button" style={{ marginLeft: "5px" }}>
                    <i className="fa fa-arrow-down" />
                </button>
                <button className="btn btn-secondary" type="button" style={{ marginLeft: "5px" }}>
                    <i className="fa fa-arrow-up" />
                </button>
                <button className="btn btn-secondary" type="button" style={{ marginLeft: "5px" }}>
                    Replace
                </button>
                <button className="btn btn-secondary" type="button" style={{ marginLeft: "5px" }}>
                    Replace All
                </button>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SearchReplace />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
});
