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
import { createTestingStore } from "../../../testUtils/testingStore";
import { mount } from "enzyme";
import { removeDraftJsDynamicValues } from "../../../testUtils/testUtils";
import { updateCues, updateEditingCueIndex } from "../cueSlices";
import { AnyAction } from "redux";

let testingStore = createTestingStore();

const cues = [
    { vttCue: new VTTCue(1, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(1, 7200, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

describe("CueEdit", () => {
    beforeEach(() => { testingStore = createTestingStore(); });
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
                                className="sbte-time-input mousetrap"
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
                                className="sbte-time-input mousetrap"
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

    it("updates pendingCueChanges flag in redux store when start time changes", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[1]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(0)
            .simulate("change", { target: { value: "00:00:03.000", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().pendingCueChanges).toEqual(true);
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

    it("updates pendingCueChanges flag in redux store when end time changes", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[1]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(1)
            .simulate("change", { target: { value: "00:00:05.500", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().pendingCueChanges).toEqual(true);
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

    it("updates pendingCueChanges flag in redux store when cue position changes", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        const cue = { vttCue, cueCategory: "DIALOGUE" } as CueDto;
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cue} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find(PositionButton).props().changePosition(Position.Row2Column5);

        // THEN
        expect(testingStore.getState().pendingCueChanges).toEqual(true);
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
        actualNode.find("a.dropdown-item").at(1).simulate("click");

        // THEN
        expect(testingStore.getState().cues[0].cueCategory).toEqual("ONSCREEN_TEXT");
    });

    it("updates pendingCueChanges flag in redux store when line category changes", () => {
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
        actualNode.find("a.dropdown-item").at(1).simulate("click");

        // THEN
        expect(testingStore.getState().pendingCueChanges).toEqual(true);
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

    it("should limit editing cue time to next cue", () => {
        // GIVEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const vttCue = new VTTCue(0, 2, "someText");
        const cue = { vttCue, cueCategory: "ONSCREEN_TEXT" } as CueDto;

        // WHEN
        mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cue} playerTime={1} />
            </Provider>
        );

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1);
    });

    it("should not limit editing cue time to next cue if last cue", () => {
        // GIVEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const vttCue = new VTTCue(999, 10000, "someText");
        const cue = { vttCue, cueCategory: "ONSCREEN_TEXT" } as CueDto;

        // WHEN
        mount(
            <Provider store={testingStore} >
                <CueEdit index={1} cue={cue} playerTime={1} />
            </Provider>
        );

        // THEN
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(999);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(10000);
    });

    it("Increases cue startTime to max value relative" +
        " to cue endtime if arrow up shortcut clicked and player time overlaps", () => {
        // GIVEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        // WHEN
        mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cues[0]} playerTime={0.6} />
            </Provider>
        );
        simulant.fire(
            document.documentElement, "keydown",
            { keyCode: Character.ARROW_UP, shiftKey: true, altKey: true });


        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0.5);
    });

    it("Sets cue endtime to min value relative" +
        " to cue start time if arrow down shortcut clicked and player time overlaps", () => {
        // GIVEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        // WHEN
        mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cues[0]} playerTime={1.1} />
            </Provider>
        );
        simulant.fire(
            document.documentElement, "keydown",
            { keyCode: Character.ARROW_DOWN, shiftKey: true, altKey: true });


        // THEN
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1.5);
    });

    it("Force set starttime to max value if passed invalid starttime range value", () => {
        // GIVEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[0]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(0)
            .simulate("change", { target: { value: "00:00:00.600", selectionEnd: 12  }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0.5);
    });

    it("Force set endtime to lowest value if passed invalid endtime range value", () => {
        // GIVEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[0]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(1)
            .simulate("change", { target: { value: "00:00:00.400", selectionEnd: 12  }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1.5);
    });

    it("Force set endtime to lowest value if passed endtime value equals to startime", () => {
        // GIVEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[0]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(1)
            .simulate("change", { target: { value: "00:00:00.000", selectionEnd: 12  }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1.5);
    });

    it("plays cue when play shortcut is typed", () => {
        // GIVEN
        const vttCue = new VTTCue(1.6, 3, "someText");
        const cue = { vttCue, cueCategory: "ONSCREEN_TEXT" } as CueDto;
        mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cue} playerTime={1} />
            </Provider>
        );

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.K_CHAR, shiftKey: true, altKey: true });

        // THEN
        expect(testingStore.getState().changePlayerTime).toEqual(1.6);
    });

    it("adds cue when ENTER is pressed on last cue", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
        testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
        mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cue} playerTime={1} />
            </Provider>
        );

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ENTER });


        // THEN
        expect(testingStore.getState().cues.length).toEqual(2);
        expect(testingStore.getState().editingCueIndex).toEqual(1);
    });

    it("moves cue editing mode to next cue when ENTER is pressed on non-last", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
        mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cues[0]} playerTime={1} />
            </Provider>
        );

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ENTER });


        // THEN
        expect(testingStore.getState().cues.length).toEqual(2);
        expect(testingStore.getState().editingCueIndex).toEqual(1);
    });

    it("closes cue editing mode when ESCAPE is pressed", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
        testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
        mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cue} playerTime={1} />
            </Provider>
        );

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ESCAPE });


        // THEN
        expect(testingStore.getState().cues.length).toEqual(1);
        expect(testingStore.getState().editingCueIndex).toEqual(-1);
    });
});
