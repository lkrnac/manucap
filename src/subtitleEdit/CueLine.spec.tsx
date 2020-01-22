import "../testUtils/initBrowserEnvironment";

import "video.js"; // VTTCue definition
import CueLine from "./CueLine";
import CueTextEditor from "./CueTextEditor";
import { Position } from "./cueUtils";
import PositionButton from "./PositionButton";
import { Provider } from "react-redux";
import React from "react";
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
                        flex: "1 1 25%",
                        display: "flex",
                        flexDirection: "column",
                        paddingLeft: "20px",
                        paddingTop: "15px",
                        justifyContent: "space-between"
                    }}
                    >
                        <div>
                            <div id="time-start-1" style={{ display: "flex" }} className="sbte-time-editor">
                                <div style={{ flexFlow: "column" }}>
                                    <input
                                        id="time-start-1-minutes"
                                        type="text"
                                        className="sbte-time-editor-input"
                                        value="000"
                                        onChange={(): void => {}}
                                    />
                                </div>
                                <label style={{ verticalAlign: "bottom", padding: "5px" }}>:</label>
                                <div style={{ flexFlow: "column" }}>
                                    <input
                                        id="time-start-1-seconds"
                                        type="text"
                                        className="sbte-time-editor-input"
                                        style={{ width: "30px" }}
                                        value="00"
                                        onChange={(): void => {}}
                                    />
                                </div>
                                <label style={{ verticalAlign: "bottom", padding: "5px" }}>.</label>
                                <div style={{ flexFlow: "column" }}>
                                    <input
                                        id="time-start-1-millis"
                                        type="text"
                                        className="sbte-time-editor-input"
                                        value="000"
                                        onChange={(): void => {}}
                                    />
                                </div>
                            </div>
                            <div id="time-end-1" style={{ display: "flex" }} className="sbte-time-editor">
                                <div style={{ flexFlow: "column" }}>
                                    <input
                                        id="time-end-1-minutes"
                                        type="text"
                                        className="sbte-time-editor-input"
                                        value="000"
                                        onChange={(): void => {}}
                                    />
                                </div>
                                <label style={{ verticalAlign: "bottom", padding: "5px" }}>:</label>
                                <div style={{ flexFlow: "column" }}>
                                    <input
                                        id="time-end-1-seconds"
                                        type="text"
                                        className="sbte-time-editor-input"
                                        style={{ width: "30px" }}
                                        value="00"
                                        onChange={(): void => {}}
                                    />
                                </div>
                                <label style={{ verticalAlign: "bottom", padding: "5px" }}>.</label>
                                <div style={{ flexFlow: "column" }}>
                                    <input
                                        id="time-end-1-millis"
                                        type="text"
                                        className="sbte-time-editor-input"
                                        value="000"
                                        onChange={(): void => {}}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }} >
                            <button
                                className="btn btn-outline-secondary"
                                style={{ marginBottom: "5px" }}
                            >
                                Dialogue
                            </button>
                            <div style={{ marginBottom: "5px", marginRight: "10px" }} className="dropdown">
                                <button
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    id="dropdown-basic"
                                    type="button"
                                    className="dropdown-toggle btn btn-outline-secondary"
                                >
                                    ↓↓ <span className="caret" />
                                </button>
                            </div>
                        </div>
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
                        flex: "1 1 25%",
                        display: "flex",
                        flexDirection: "column",
                        paddingLeft: "20px",
                        paddingTop: "15px",
                        justifyContent: "space-between"
                    }}
                    >
                        <div>
                            <div id="time-start-1" style={{ display: "flex" }} className="sbte-time-editor">
                                <div style={{ flexFlow: "column" }}>
                                    <input
                                        id="time-start-1-minutes"
                                        type="text"
                                        className="sbte-time-editor-input"
                                        value="000"
                                        onChange={(): void => {}}
                                    />
                                </div>
                                <label style={{ verticalAlign: "bottom", padding: "5px" }}>:</label>
                                <div style={{ flexFlow: "column" }}>
                                    <input
                                        id="time-start-1-seconds"
                                        type="text"
                                        className="sbte-time-editor-input"
                                        style={{ width: "30px" }}
                                        value="01"
                                        onChange={(): void => {}}
                                    />
                                </div>
                                <label style={{ verticalAlign: "bottom", padding: "5px" }}>.</label>
                                <div style={{ flexFlow: "column" }}>
                                    <input
                                        id="time-start-1-millis"
                                        type="text"
                                        className="sbte-time-editor-input"
                                        value="000"
                                        onChange={(): void => {}}
                                    />
                                </div>
                            </div>
                            <div id="time-end-1" style={{ display: "flex" }} className="sbte-time-editor">
                                <div style={{ flexFlow: "column" }}>
                                    <input
                                        id="time-end-1-minutes"
                                        type="text"
                                        className="sbte-time-editor-input"
                                        value="000"
                                        onChange={(): void => {}}
                                    />
                                </div>
                                <label style={{ verticalAlign: "bottom", padding: "5px" }}>:</label>
                                <div style={{ flexFlow: "column" }}>
                                    <input
                                        id="time-end-1-seconds"
                                        type="text"
                                        className="sbte-time-editor-input"
                                        style={{ width: "30px" }}
                                        value="02"
                                        onChange={(): void => {}}
                                    />
                                </div>
                                <label style={{ verticalAlign: "bottom", padding: "5px" }}>.</label>
                                <div style={{ flexFlow: "column" }}>
                                    <input
                                        id="time-end-1-millis"
                                        type="text"
                                        className="sbte-time-editor-input"
                                        value="000"
                                        onChange={(): void => {}}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }} >
                            <button
                                className="btn btn-outline-secondary"
                                style={{ marginBottom: "5px" }}
                            >
                                Dialogue
                            </button>
                            <div style={{ marginBottom: "5px", marginRight: "10px" }} className="dropdown">
                                <button
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    id="dropdown-basic"
                                    type="button"
                                    className="dropdown-toggle btn btn-outline-secondary"
                                >
                                    ↓↓ <span className="caret" />
                                </button>
                            </div>
                        </div>
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
        actualNode.find("#time-start-0-minutes").simulate("change", { target: { value: "15" }});

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
        actualNode.find("#time-start-0-seconds").simulate("change", { target: { value: "10" }});

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
        actualNode.find("#time-start-0-millis").simulate("change", { target: { value: "865" }});

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
        actualNode.find("#time-end-0-millis").simulate("change", { target: { value: "2220" }});

        // THEN
        expect(testingStore.getState().cues[0].endTime).toEqual(2.22);
    });

    it("pads with 0s in time editor inputs", () => {
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
        expect(actualNode.find("#time-end-0-millis").props().value).toEqual("045");
    });

    it("maxes out to max values in time editor", () => {
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
        expect(actualNode.find("#time-start-0-millis").props().value).toEqual("999");
    });

    it("maintains cue styling when start time changes", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "someText");
        cue.position = 60;
        cue.align = "end";
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={0} cue={cue} />
            </Provider>
        );

        // WHEN
        actualNode.find("#time-start-0-minutes").simulate("change", { target: { value: "15" }});

        // THEN
        expect(testingStore.getState().cues[0].position).toEqual(60);
        expect(testingStore.getState().cues[0].align).toEqual("end");
    });

    it("maintains cue styling when start time changes", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "someText");
        cue.position = 60;
        cue.align = "end";
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={0} cue={cue} />
            </Provider>
        );

        // WHEN
        actualNode.find("#time-end-0-millis").simulate("change", { target: { value: "2220" }});

        // THEN
        expect(testingStore.getState().cues[0].position).toEqual(60);
        expect(testingStore.getState().cues[0].align).toEqual("end");
    });

    it("updates cue position", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "someText");
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={0} cue={cue} />
            </Provider>
        );

        // WHEN
        actualNode.find(PositionButton).props().changePosition(Position.Row2Column2);

        // THEN
        expect(testingStore.getState().cues[0].line).toEqual(4);
        expect(testingStore.getState().cues[0].align).toEqual("start");
        expect(testingStore.getState().cues[0].positionAlign).toEqual("center");
        expect(testingStore.getState().cues[0].position).toEqual(65);
    });
});
