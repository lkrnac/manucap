import "../testUtils/initBrowserEnvironment";
import { mount } from "enzyme";
import React from "react";
import ToggleButton from "./ToggleButton";

describe("ToggleButton", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <button
                type="button"
            >
                Click me!
            </button>
        );

        // WHEN
        const actualNode = mount(
            <ToggleButton
                render={() => (
                    <>Click me!</>
                )}
            />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
});
