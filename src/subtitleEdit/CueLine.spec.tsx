import "../testUtils/initBrowserEnvironment";

import "video.js"; // VTTCue definition
import CueLine from "./CueLine";
import CueTextEditor from "./CueTextEditor";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import { removeDraftJsDynamicValues } from "../testUtils/testUtils";
import testingStore from "../testUtils/testingStore";

const cues = [
    new VTTCue(0, 0, "Caption Line 1"),
    new VTTCue(1, 2, "Caption Line 2"),
    new VTTCue(67.045, 359999.999, "Caption Line 3"),
];

describe("CueLine", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="sbte-cue-line" style={{ display: "flex" }}>
                    <div style={{
                        flex: "1 1 25%", display: "flex", flexDirection: "column",
                        paddingLeft: "20px", paddingTop: "15px"
                    }}
                    >
                        <input
                            type="text"
                            className="sbte-time-input"
                            style={{
                                margin: "5px",
                                width: "110px",
                                maxWidth: "160px",
                                padding: "5px"
                            }}
                            value="00:00:00.000"
                            onChange={(): void => {}}
                        />
                        <input
                            type="text"
                            className="sbte-time-input"
                            style={{
                                margin: "5px",
                                width: "110px",
                                maxWidth: "160px",
                                padding: "5px"
                            }}
                            value="00:00:00.000"
                            onChange={(): void => {}}
                        />
                    </div>
                    <div className="sbte-left-border" style={{ flex: "1 1 75%" }}>
                        <CueTextEditor key={1} index={1} cue={cues[0]} />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
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
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="sbte-cue-line" style={{ display: "flex" }}>
                    <div style={{
                        flex: "1 1 25%", display: "flex", flexDirection: "column",
                        paddingLeft: "20px", paddingTop: "15px"
                    }}
                    >
                        <input
                            type="text"
                            className="sbte-time-input"
                            style={{
                                margin: "5px",
                                width: "110px",
                                maxWidth: "160px",
                                padding: "5px"
                            }}
                            value="00:00:01.000"
                            onChange={(): void => {}}
                        />
                        <input
                            type="text"
                            className="sbte-time-input"
                            style={{
                                margin: "5px",
                                width: "110px",
                                maxWidth: "160px",
                                padding: "5px"
                            }}
                            value="00:00:02.000"
                            onChange={(): void => {}}
                        />
                    </div>
                    <div className="sbte-left-border" style={{ flex: "1 1 75%" }}>
                        <CueTextEditor key={1} index={1} cue={cues[1]} />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("updates cue in redux store when start time minutes changed", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={0} cue={cues[0]} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(0)
            .simulate("change", { target: { value: "00:15:00.000", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().cues[0].startTime).toEqual(900);
    });

    it("updates cue in redux store when start time seconds changed", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={0} cue={cues[0]} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(0)
            .simulate("change", { target: { value: "00:00:10.000", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().cues[0].startTime).toEqual(10);
    });

    it("updates cue in redux store when start time millis changed", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={0} cue={cues[0]} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(0)
            .simulate("change", { target: { value: "00:00:00.865", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().cues[0].startTime).toEqual(.865);
    });

    it("updates cue in redux store when end time changed", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={0} cue={cues[0]} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(1)
            .simulate("change", { target: { value: "00:00:02.220", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().cues[0].endTime).toEqual(2.22);
    });

});
