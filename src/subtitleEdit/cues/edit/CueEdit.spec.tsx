import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import { Character } from "../../shortcutConstants";
import { CueDto } from "../../model";
import CueEdit from "./CueEdit";
import CueTextEditor from "./CueTextEditor";
import { Position } from "../cueUtils";
import PositionButton from "./PositionButton";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import { removeDraftJsDynamicValues } from "../../../testUtils/testUtils";
import testingStore from "../../../testUtils/testingStore";

const cues = [
    { vttCue: new VTTCue(1, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(1, 7200, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

describe("CueEdit", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex" }} className="bg-white">
                    <div
                        style={{
                            flex: "1 1 300px",
                            display: "flex",
                            flexDirection: "column",
                            paddingLeft: "10px",
                            paddingTop: "5px",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{
                            display: "flex",
                            flexDirection:"column",
                            paddingBottom: "15px"
                        }}
                        >
                            <input
                                type="text"
                                className="sbte-time-input"
                                style={{
                                    marginBottom: "5px",
                                    width: "110px",
                                    maxWidth: "200px",
                                    padding: "5px",
                                    textAlign: "center"
                                }}
                                value="00:00:01.000"
                                onChange={(): void => undefined}
                            />
                            <input
                                type="text"
                                className="sbte-time-input"
                                style={{
                                    marginBottom: "5px",
                                    width: "110px",
                                    maxWidth: "200px",
                                    padding: "5px",
                                    textAlign: "center"
                                }}
                                value="00:00:02.000"
                                onChange={(): void => undefined}
                            />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }} >
                            <div className="dropdown">
                                <button
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    id="cue-line-category"
                                    type="button"
                                    className="dropdown-toggle btn btn-outline-secondary"
                                >
                                    Dialogue
                                </button>
                            </div>
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
                    <div className="sbte-left-border" style={{ flex: "1 1 70%" }}>
                        <CueTextEditor key={1} index={1} vttCue={cues[0].vttCue} />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={1} cue={cues[0]} playerTime={0} />
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
                <CueEdit index={0} cue={cues[1]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(0)
            .simulate("change", { target: { value: "00:15:00.000", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(900);
    });

    it("updates cue in redux store when start time seconds changed", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[1]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(0)
            .simulate("change", { target: { value: "00:00:10.000", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(10);
    });

    it("updates cue in redux store when start time millis changed", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[0]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(0)
            .simulate("change", { target: { value: "00:00:00.865", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(.865);
    });

    it("updates cue in redux store when end time changed", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[0]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(1)
            .simulate("change", { target: { value: "00:00:02.220", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2.22);
    });

    it("maintains cue styling when start time changes", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.position = 60;
        vttCue.align = "end";
        const cue = { vttCue, cueCategory: "DIALOGUE" } as CueDto;
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cue} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(0)
            .simulate("change", { target: { value: "00:15:00.000", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.position).toEqual(60);
        expect(testingStore.getState().cues[0].vttCue.align).toEqual("end");
    });

    it("maintains cue styling when end time changes", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.position = 60;
        vttCue.align = "end";
        const cue = { vttCue, cueCategory: "DIALOGUE" } as CueDto;
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cue} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(0)
            .simulate("change", { target: { value: "00:00:00.222", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.position).toEqual(60);
        expect(testingStore.getState().cues[0].vttCue.align).toEqual("end");
    });

    it("updates cue position", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        const cue = { vttCue, cueCategory: "DIALOGUE" } as CueDto;
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cue} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find(PositionButton).props().changePosition(Position.Row2Column2);

        // THEN
        expect(testingStore.getState().cues[0].vttCue.line).toEqual(4);
        expect(testingStore.getState().cues[0].vttCue.align).toEqual("start");
        expect(testingStore.getState().cues[0].vttCue.positionAlign).toEqual("center");
        expect(testingStore.getState().cues[0].vttCue.position).toEqual(65);
    });

    it("updates line category", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        const cue = { vttCue, cueCategory: "DIALOGUE" } as CueDto;
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cue} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("button#cue-line-category").simulate("click");
        actualNode.find("a.sbte-main-text-color").at(1).simulate("click");

        // THEN
        expect(testingStore.getState().cues[0].cueCategory).toEqual("ONSCREEN_TEXT");
    });

    it("passes down current line category", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        const cue = { vttCue, cueCategory: "ONSCREEN_TEXT" } as CueDto;

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cue} playerTime={0} />
            </Provider>
        );

        // THEN
        expect(actualNode.find("button#cue-line-category").text()).toEqual("On Screen Text");
    });

    it("should set player time to video start time on mod+shift+up shortcut", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 2, "someText");
        const cue = { vttCue, cueCategory: "ONSCREEN_TEXT" } as CueDto;
        mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cue} playerTime={1} />
            </Provider>
        );

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ARROW_UP, shiftKey: true, altKey: true });

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
    });

    it("should set player time to video end time on mod+shift+down shortcut", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 2, "someText");
        const cue = { vttCue, cueCategory: "ONSCREEN_TEXT" } as CueDto;
        mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cue} playerTime={1} />
            </Provider>
        );

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ARROW_DOWN, shiftKey: true, altKey: true });

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1);
    });

    it("prevents start time from being greater than end time", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[0]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(0)
            .simulate("change", { target: { value: "00:00:03.000", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
    });

    it("prevents end time from being less than start time", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[0]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(1)
            .simulate("change", { target: { value: "00:00:00.500", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
    });
});
