import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import Checkbox from "../common/Checkbox";

describe("Checkbox", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = enzyme.mount(
            <div className="form-check">
                <input type="checkbox"
                       id={"checkbox-id"}
                       className={"checkbox-id form-check-input"}
                       checked={false}
                       readOnly={false}/>
                <label htmlFor={"checkbox-id"}
                       className="form-check-label">
                    Label
                </label>
            </div>
        );

        // WHEN
        const actualNode = enzyme.mount(
            <Checkbox
                id="id"
                checked={false}
                labelMessage="Label"
                readonly={false}
            />
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });
    it("renders checked readOnly", () => {
        // GIVEN
        const expectedNode = enzyme.mount(
            <div className="form-check">
                <input type="checkbox"
                       id={"checkbox-id"}
                       className={"checkbox-id form-check-input"}
                       checked={true}
                       readOnly={true}/>
                <label htmlFor={"checkbox-id"}
                       className="form-check-label">
                    Label
                </label>
            </div>
        );

        // WHEN
        const actualNode = enzyme.mount(
            <Checkbox
                id="id"
                checked={true}
                labelMessage="Label"
                readonly={true}
            />
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

});
