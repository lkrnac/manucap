import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import "video.js"; // VTTCue definition
import { Provider } from "react-redux";
import testingStore from "../testUtils/testingStore";
import CueLine from "./CueLine";
import TimeEditor from "./TimeEditor";
import CueTextEditor from "./CueTextEditor";
import { removeDraftJsDynamicValues } from "../testUtils/testUtils";

const cues = [
    new VTTCue(0, 0, "Caption Line 1"),
    new VTTCue(1, 2, "Caption Line 2"),
];

describe("CueLine", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = enzyme.mount(
            <Provider store={testingStore}>
                <div className="sbte-cue-line" style={{ display: "flex" }}>
                    <div style={{
                        flex: "1 1 25%", display: "flex", flexDirection: "column",
                        paddingLeft: "20px", paddingTop: "15px"
                    }}
                    >
                        <TimeEditor id="1-time-start" />
                        <TimeEditor id="1-time-end" />
                    </div>
                    <div className="sbte-left-border" style={{ flex: "1 1 75%" }}>
                        <CueTextEditor key={1} index={1} cue={cues[0]} />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[0]} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders with time values", () => {
        // GIVEN
        const expectedNode = enzyme.mount(
            <Provider store={testingStore}>
                <div className="sbte-cue-line" style={{ display: "flex" }}>
                    <div style={{
                        flex: "1 1 25%", display: "flex", flexDirection: "column",
                        paddingLeft: "20px", paddingTop: "15px"
                    }}
                    >
                        <TimeEditor id="1-time-start" time={1} />
                        <TimeEditor id="1-time-end" time={2} />
                    </div>
                    <div className="sbte-left-border" style={{ flex: "1 1 75%" }}>
                        <CueTextEditor key={1} index={1} cue={cues[1]} />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });
});
