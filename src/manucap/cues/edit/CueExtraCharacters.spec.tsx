import "../../../testUtils/initBrowserEnvironment";

import { render } from "@testing-library/react";

import { CueExtraCharacters } from "./CueExtraCharacters";

describe("CueExtraCharacters", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <span className="text-red-primary">
                <div className="text">sample text</div>
            </span>
        );

        // WHEN
        const actualNode = render(
            <CueExtraCharacters>
                <div className="text">sample text</div>
            </CueExtraCharacters>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });
});
