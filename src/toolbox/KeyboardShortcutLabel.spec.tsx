import "../testUtils/initBrowserEnvironment";
import KeyboardShortcutLabel from "./KeyboardShortcutLabel";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import { os } from "platform";
import testingStore from "../testUtils/testingStore";


describe("KeyboardShortcutLabel", () => {
    it("renders", () => {
        // GIVEN
        const commandKey = os && os.family === "OS X" ? "Command" : "Ctrl";
        const expectedNode = mount(
            <div style={{ display: "flex", alignItems: "center" }}>
                <h5><span className="badge badge-secondary">{commandKey}</span></h5>
                <span>&#160;+&#160;</span>
                <h5><span className="badge badge-secondary">Shift</span></h5>
                <span>&#160;+&#160;</span>
                <h5><span className="badge badge-secondary">o</span></h5>
                <span>&#160;&#160;&#160;or&#160;&#160;&#160;</span>
                <h5><span className="badge badge-secondary">Alt</span></h5>
                <span>&#160;+&#160;</span>
                <h5><span className="badge badge-secondary">Shift</span></h5>
                <span>&#160;+&#160;</span>
                <h5> <span className="badge badge-secondary">o</span></h5>
                <span>&#160;&#160;&#160;:&#160;&#160;&#160;</span>
                <span>Toggle Play / Pause</span>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <KeyboardShortcutLabel character="o" name="Toggle Play / Pause" />
            </Provider>
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });
});
