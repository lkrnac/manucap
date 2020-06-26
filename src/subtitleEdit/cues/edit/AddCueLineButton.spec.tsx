import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import AddCueLineButton from "./AddCueLineButton";
import { AnyAction } from "@reduxjs/toolkit";
import { CueDto } from "../../model";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";
import { updateCues } from "../cueSlices";

describe("AddCueLineButton", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <button
                style={{ maxHeight: "38px", margin: "5px" }}
                className="btn btn-outline-secondary sbte-add-cue-button"
            >
                <b>+</b>
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with custom text", () => {
        // GIVEN
        const expectedNode = mount(
            <button
                style={{ maxHeight: "38px", margin: "5px" }}
                className="btn btn-outline-secondary sbte-add-cue-button"
            >
                <span>Add Cue Line</span>
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton text="Add Cue Line" cueIndex={0} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("adds cue when clicked", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
        testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-add-cue-button").simulate("click");

        // THEN
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("");
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
        expect(testingStore.getState().cues[1].vttCue.align).toEqual("center");
        expect(testingStore.getState().cues[1].vttCue.line).toEqual("auto");
        expect(testingStore.getState().cues[1].vttCue.position).toEqual("auto");
        expect(testingStore.getState().cues[1].vttCue.positionAlign).toEqual("auto");
        expect(testingStore.getState().cues[1].cueCategory).toEqual("DIALOGUE");
    });

    it("adds cue with non-default category when clicked", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "AUDIO_DESCRIPTION" } as CueDto;
        testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-add-cue-button").simulate("click");

        // THEN
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("");
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
        expect(testingStore.getState().cues[1].cueCategory).toEqual("AUDIO_DESCRIPTION");
    });

    it("adds cue with non-default position when clicked", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
        cue.vttCue.align = "left";
        cue.vttCue.line = 8;
        cue.vttCue.position = 35;
        cue.vttCue.positionAlign = "center";
        testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-add-cue-button").simulate("click");

        // THEN
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("");
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
        expect(testingStore.getState().cues[1].vttCue.align).toEqual("left");
        expect(testingStore.getState().cues[1].vttCue.line).toEqual(8);
        expect(testingStore.getState().cues[1].vttCue.position).toEqual(35);
        expect(testingStore.getState().cues[1].vttCue.positionAlign).toEqual("center");
    });

    it("Does not add cue if clicking button creates overlap", () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 1.225, "Caption Line 1"), cueCategory: "DIALOGUE", corrupted: false },
            { vttCue: new VTTCue(1.225, 2, "Caption Line 2"), cueCategory: "DIALOGUE", corrupted: false },
        ] as CueDto[];
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-add-cue-button").simulate("click");


        // THEN
        expect(testingStore.getState().cues.length).toEqual(2);
    });

    it("Does not add cue if clicking button creates less than 0.5 gap", () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE", corrupted: false },
            { vttCue: new VTTCue(1.09, 2, "Caption Line 2"), cueCategory: "DIALOGUE", corrupted: false },
        ] as CueDto[];
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-add-cue-button").simulate("click");


        // THEN
        expect(testingStore.getState().cues).toHaveLength(2);
    });

    it("Add cue if clicking button if there is greater or equal 0.5 gap", () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(5.5, 6, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-add-cue-button").simulate("click");


        // THEN
        expect(testingStore.getState().cues).toHaveLength(3);
    });

    it("Always add cue if clicking button on last cue", () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 1.225, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1.225, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={1} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-add-cue-button").simulate("click");


        // THEN
        expect(testingStore.getState().cues).toHaveLength(3);
    });
});
