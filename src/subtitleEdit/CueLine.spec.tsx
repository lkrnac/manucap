import "../testUtils/initBrowserEnvironment";

import "video.js"; // VTTCue definition
import CueLine from "./CueLine";
import CueTextEditor from "./CueTextEditor";
import { Provider } from "react-redux";
import React from "react";
import TimeEditor from "./TimeEditor";
import { mount } from "enzyme";
import { removeDraftJsDynamicValues } from "../testUtils/testUtils";
import testingStore from "../testUtils/testingStore";

const cues = [
    new VTTCue(0, 0, "Caption Line 1"),
    new VTTCue(1, 2, "Caption Line 2"),
    new VTTCue(62000, 67.045, "Caption Line 2"),
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
                        <TimeEditor id="time-start-1" onChange={jest.fn()} />
                        <TimeEditor id="time-end-1" onChange={jest.fn()} />
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
                        <TimeEditor id="time-start-1" time={1} onChange={jest.fn()} />
                        <TimeEditor id="time-end-1" time={2} onChange={jest.fn()} />
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

    it("updates cue in redux store when start time changed", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={0} cue={cues[0]} />
            </Provider>
        );

        // WHEN
        actualNode.find("#time-start-0-seconds").simulate("change", { target: { value: "10" }});

        // THEN
        expect(testingStore.getState().cues[0].startTime).toEqual(10);
    });

    it("updates cue in redux store when end time changed", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={0} cue={cues[0]} />
            </Provider>
        );

        // WHEN
        actualNode.find("#time-end-0-milliseconds").simulate("change", { target: { value: "2220" }});

        // THEN
        expect(testingStore.getState().cues[0].endTime).toEqual(2.22);
    });

    it("time editor inputs pad with 0s", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={0} cue={cues[2]} />
            </Provider>
        );

        // WHEN
        // THEN
        expect(testingStore.getState().cues[0].endTime).toEqual(67.045);
        expect(actualNode.find("#time-end-0-minutes").props().value).toEqual("001");
        expect(actualNode.find("#time-end-0-seconds").props().value).toEqual("07");
        expect(actualNode.find("#time-end-0-milliseconds").props().value).toEqual("045");
    });

    it("time editor max values", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={0} cue={cues[2]} />
            </Provider>
        );

        // WHEN
        // THEN
        expect(actualNode.find("#time-start-0-minutes").props().value).toEqual("999");
        expect(actualNode.find("#time-start-0-seconds").props().value).toEqual("59");
        expect(actualNode.find("#time-start-0-milliseconds").props().value).toEqual("999");
    });

});
