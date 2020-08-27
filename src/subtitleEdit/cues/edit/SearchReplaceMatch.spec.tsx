import "../../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount } from "enzyme";
import { SearchReplaceMatch } from "./SearchReplaceMatch";

describe("SearchReplaceMatch", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <span style={{ border: "solid 1px rgb(75,0,130)", backgroundColor: "rgb(230,230,250)" }}>
                <div className="text" />
            </span>
        );

        // WHEN
        const actualNode = mount(
            <SearchReplaceMatch>
                <div className="text" />
            </SearchReplaceMatch>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
});
