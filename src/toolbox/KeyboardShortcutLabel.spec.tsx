import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import {Provider} from "react-redux";
import { os } from "platform";
import {testingStore} from "../testUtils/testingStore";
import KeyboardShortcutLabel from "./KeyboardShortcutLabel";


describe("KeyboardShortcutLabel", () => {
    it("renders", () => {
        // GIVEN
        const commandKey = os && os.family === "OS X" ? "Command" : "Ctrl";
        const expectedNode = enzyme.mount(
            <div style={{display: "flex", alignItems: "center"}}>
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
        const actualNode = enzyme.mount(
            <Provider store={testingStore} >
                <KeyboardShortcutLabel character="o" name="Toggle Play / Pause" />
            </Provider>
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });
});
