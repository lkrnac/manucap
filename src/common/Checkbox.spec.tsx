import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import Checkbox from "../common/Checkbox";

describe("Checkbox", () => {
    it("renders unchecked", () => {
        // GIVEN
        const expectedNode = enzyme.mount(
            <div className="form-check">
                <input type="checkbox"
                       id={"checkbox-id"}
                       className={"checkbox-id form-check-input"}
                       readOnly/>
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
                readonly={true}
            />
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });
    it("renders checked", () => {
        // GIVEN
        const expectedNode = enzyme.mount(
            <div className="form-check">
                <input type="checkbox"
                       id={"checkbox-id"}
                       className={"checkbox-id form-check-input"}
                       checked
                       readOnly/>
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
