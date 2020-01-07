import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";
import TimeEditor from "./TimeEditor";

describe("TimeEditor", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = enzyme.mount(
            <div style={{display: "flex"}} className="sbte-time-editor">
                <div style={{flexFlow: "column"}}>
                    <input type="text" className="sbte-time-editor-input"/>
                </div>
                <div style={{flexFlow: "column"}}>
                    <div style={{verticalAlign: "bottom", padding: "5px"}}><span>:</span></div>
                </div>
                <div style={{flexFlow: "column"}}>
                    <input type="text" className="sbte-time-editor-input" style={{width: "30px"}}/>
                </div>
                <div>
                    <div style={{verticalAlign: "bottom", padding: "5px"}}><span>.</span></div>
                </div>
                <div style={{flexFlow: "column"}}>
                    <input type="text" className="sbte-time-editor-input"/>
                </div>
            </div>
        );

        // WHEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore} >
                <TimeEditor />
            </Provider>
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });
});
