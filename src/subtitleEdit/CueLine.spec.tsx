import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import "video.js"; // VTTCue definition
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";
import CueLine from "./CueLine";
import TimeEditor from "./TimeEditor";
import CueTextEditor from "./CueTextEditor";
import {removeDraftJsDynamicValues} from "../testUtils/testUtils";


const cue = new VTTCue(0, 1, "Caption Line 1");

describe("CueLine", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = enzyme.mount(
            <Provider store={testingStore}>
                <div className="sbte-cue-line" style={{display: "flex"}}>
                    <div style={{
                        flex: "1 1 25%", display: "flex", flexDirection: "column",
                        paddingLeft: "20px", paddingTop: "15px"
                    }}>
                        <TimeEditor id="1-time-start"/>
                        <TimeEditor id="1-time-end"/>
                    </div>
                    <div className="sbte-left-border" style={{flex: "1 1 75%"}}>
                        <CueTextEditor key={1} index={1} cue={cue}/>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cue}/>
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });
});
