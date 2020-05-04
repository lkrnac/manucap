import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import { Character } from "../../shortcutConstants";
import { CueDto, Track } from "../../model";
import CueEdit from "./CueEdit";
import CueTextEditor from "./CueTextEditor";
import { Position } from "../cueUtils";
import PositionButton from "./PositionButton";
import { Provider } from "react-redux";
import React from "react";
import { createTestingStore } from "../../../testUtils/testingStore";
import { mount } from "enzyme";
import { removeDraftJsDynamicValues } from "../../../testUtils/testUtils";
import { setValidationError, updateCues, updateEditingCueIndex, updateSourceCues, setSaveTrack } from "../cueSlices";
import { AnyAction } from "redux";
import { SubtitleSpecification } from "../../toolbox/model";
import { readSubtitleSpecification } from "../../toolbox/subtitleSpecificationSlice";
import { updateEditingTrack } from "../../trackSlices";
import SubtitleEdit from "../../SubtitleEdit";
import _ from "lodash";
import sinon from "sinon";

let testingStore = createTestingStore();

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
    mediaTitle: "This is the video title",
} as Track;

const cues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

describe("CueEdit", () => {
    const saveTrack = sinon.spy();

    beforeAll(() => {
        // @ts-ignore
        sinon.stub(_, "debounce").returns(() => { saveTrack(); });
    });

    beforeEach(() => {
        testingStore = createTestingStore();
        const testingSubtitleSpecification = {
            minCaptionDurationInMillis: 500,
            maxCaptionDurationInMillis: 960000,
            maxLinesPerCaption: 2,
            maxCharactersPerLine: 30,
            enabled: true
        } as SubtitleSpecification;

        testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

    });
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
                                value="00:00:00.000"
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
                        <CueTextEditor key={1} index={0} vttCue={cues[0].vttCue} />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit
                    index={0}
                    cue={{ vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto}
                    playerTime={0}
                />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders for corrupted cue", () => {
        // GIVEN
        const corruptedCue = {
            vttCue: new VTTCue(0, 2, "Caption Line 1"),
            cueCategory: "DIALOGUE",
            corrupted: true
        } as CueDto;

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit
                    index={0}
                    cue={corruptedCue}
                    playerTime={0}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.find("div").at(0).hasClass("sbte-background-error-lighter")).toBeTruthy();
    });

    it("updates cue in redux store when start time minutes changed", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={1} cue={cues[1]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(1)
            .simulate("change", { target: { value: "00:15:00.000", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(900);
    });

    it("updates cue in redux store when start time seconds changed", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={1} cue={cues[1]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(1)
            .simulate("change", { target: { value: "00:00:10.000", selectionEnd: 12 }});

        // THEN
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(10);
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

    it("calls saveTrack in redux store when start time changes", () => {
        // GIVEN
        saveTrack.resetHistory();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[1]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(0)
            .simulate("change", { target: { value: "00:00:03.000", selectionEnd: 12 }});

        // THEN
        sinon.assert.calledOnce(saveTrack);
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

    it("calls saveTrack in redux store when end time changes", () => {
        // GIVEN
        saveTrack.resetHistory();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[1]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(1)
            .simulate("change", { target: { value: "00:00:05.500", selectionEnd: 12 }});

        // THEN
        sinon.assert.calledOnce(saveTrack);
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

    it("calls saveTrack in redux store when cue position changes", () => {
        // GIVEN
        saveTrack.resetHistory();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

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
        sinon.assert.calledOnce(saveTrack);
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

    it("calls saveTrack in redux store when line category changes", () => {
        // GIVEN
        saveTrack.resetHistory();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

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
        sinon.assert.calledOnce(saveTrack);
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
                <CueEdit index={0} cue={cue} playerTime={0.5} />
            </Provider>
        );

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ARROW_UP, shiftKey: true, altKey: true });

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0.5);
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

        const vttCue = new VTTCue(0, 4, "someText");
        const cue = { vttCue, cueCategory: "ONSCREEN_TEXT" } as CueDto;

        // WHEN
        mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cue} playerTime={1} />
            </Provider>
        );

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3);
    });

    it("should not limit editing cue time to next cue if last cue", () => {
        // GIVEN

        const vttCue = new VTTCue(7, 50, "someText");
        const cue = { vttCue, cueCategory: "ONSCREEN_TEXT" } as CueDto;

        // WHEN
        mount(
            <Provider store={testingStore} >
                <CueEdit index={1} cue={cue} playerTime={1} />
            </Provider>
        );

        // THEN
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(7);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(50);
    });

    it("Increases cue startTime to max value relative" +
        " to cue endtime if arrow up shortcut clicked and player time overlaps", () => {
        // GIVEN


        // WHEN
        mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cues[0]} playerTime={1.6} />
            </Provider>
        );
        simulant.fire(
            document.documentElement, "keydown",
            { keyCode: Character.ARROW_UP, shiftKey: true, altKey: true });


        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1.5);
    });

    it("Sets cue endtime to min value relative" +
        " to cue start time if arrow down shortcut clicked and player time overlaps", () => {
        // GIVEN


        // WHEN
        mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cues[0]} playerTime={0.4} />
            </Provider>
        );
        simulant.fire(
            document.documentElement, "keydown",
            { keyCode: Character.ARROW_DOWN, shiftKey: true, altKey: true });


        // THEN
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(0.5);
    });

    it("Force set startTime to max value if passed invalid startTime range value", () => {
        // GIVEN

        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[0]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(0)
            .simulate("change", { target: { value: "00:00:01.600", selectionEnd: 12  }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1.5);
    });

    it("Force set endtime to lowest value if passed invalid endtime range value", () => {
        // GIVEN

        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[0]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(1)
            .simulate("change", { target: { value: "00:00:00.400", selectionEnd: 12  }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(0.5);
    });

    it("Force set endtime to lowest value if passed endtime value equals to startime", () => {
        // GIVEN

        const actualNode = mount(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cues[0]} playerTime={0} />
            </Provider>
        );

        // WHEN
        actualNode.find("TimeField").at(1)
            .simulate("change", { target: { value: "00:00:00.000", selectionEnd: 12  }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(0.5);
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
        expect(testingStore.getState().videoSectionToPlay).toEqual({ startTime: 1.6, endTime: 3 });
    });

    it("adds cue when ENTER is pressed on last caption cue", () => {
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

    it("adds cue when on ENTER for last translation cue, where cue index is smaller than amount of source cues", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
        testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

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
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2);
    });

    it("escapes editing mode for last translation cue, where cue index is same last source cue index", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
        testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
        const sourceCues = [{ vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" }] as CueDto[];
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cue} playerTime={1} />
            </Provider>
        );

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ENTER });


        // THEN
        expect(testingStore.getState().cues.length).toEqual(1);
        expect(testingStore.getState().editingCueIndex).toEqual(-1);
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

    it("edits previous cue ALT+SHIFT+ESCAPE is pressed", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Cue 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
        mount(
            <Provider store={testingStore} >
                <CueEdit index={2} cue={cues[2]} playerTime={2} />
            </Provider>
        );

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ESCAPE, shiftKey: true, altKey: true });

        // THEN
        expect(testingStore.getState().editingCueIndex).toEqual(1);
    });

    it("edits previous cue CTRL+SHIFT+ESCAPE is pressed", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Cue 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
        mount(
            <Provider store={testingStore} >
                <CueEdit index={2} cue={cues[2]} playerTime={2} />
            </Provider>
        );

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ESCAPE, shiftKey: true, ctrlKey: true });

        // THEN
        expect(testingStore.getState().editingCueIndex).toEqual(1);
    });

    it("auto sets validation error to false after receiving it", (done) => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
        const actualNode = mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cue} playerTime={1} />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(setValidationError(true) as {} as AnyAction);

        // THEN
        setTimeout(() => {
            expect(testingStore.getState().validationError).toEqual(false);
            expect(actualNode.find("div").at(0).hasClass("bg-white")).toBeTruthy();
            done();
        }, 1005);
    });

    it("blinks background when when validation error occurs", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
        const actualNode = mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cue} playerTime={1} />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(setValidationError(true) as {} as AnyAction);
        actualNode.update();

        // THEN
        expect(testingStore.getState().validationError).toEqual(true);
        expect(actualNode.find("div").at(0).hasClass("blink-error-bg")).toBeTruthy();
    });

    it("adds first cue if clicked translation cue and cues are empty", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues([]) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-cue-editor").at(0).simulate("click");


        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
        expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
        expect(testingStore.getState().editingCueIndex).toEqual(0);
        expect(testingStore.getState().validationError).toEqual(false);
    });

    it("adds first cue if clicked second translation cue without creating first cue", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues([]) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-cue-editor").at(1).simulate("click");


        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
        expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
        expect(testingStore.getState().editingCueIndex).toEqual(0);
        expect(testingStore.getState().validationError).toEqual(false);
    });
});
