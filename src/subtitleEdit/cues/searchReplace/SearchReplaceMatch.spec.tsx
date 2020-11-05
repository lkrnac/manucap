import "../../../testUtils/initBrowserEnvironment";
import React from "react";
import { SearchReplaceMatch } from "./SearchReplaceMatch";
import testingStore from "../../../testUtils/testingStore";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import { Constants } from "../../constants";

describe("SearchReplaceMatch", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <span style={{ backgroundColor: Constants.BLUE_BACKGROUND_COLOR }}>
                <div className="text" />
            </span>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SearchReplaceMatch><div className="text" /></SearchReplaceMatch>
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });
});
