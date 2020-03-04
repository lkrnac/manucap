import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import AddCueLineButton from "./AddCueLineButton";
import { AnyAction } from "@reduxjs/toolkit";
import { Character } from "../../shortcutConstants";
import { CueDto } from "../../model";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";
import { updateCues } from "../cueSlices";

describe("AddCueLineButton", () => {
    it("renders", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "");
        const expectedNode = mount(
            <button className="btn btn-outline-secondary sbte-add-cue-button">
                <b>+</b>
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} vttCue={vttCue} cueCategory="DIALOGUE" />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("adds cue when clicked", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        testingStore.dispatch(updateCues([{ vttCue, cueCategory: "DIALOGUE" }]) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} vttCue={vttCue} cueCategory="DIALOGUE" />
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
        const vttCue = new VTTCue(0, 1, "someText");
        testingStore.dispatch(updateCues([{ vttCue, cueCategory: "AUDIO_DESCRIPTION" }]) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} vttCue={vttCue} cueCategory="AUDIO_DESCRIPTION" />
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
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.align = "left";
        vttCue.line = 8;
        vttCue.position = 35;
        vttCue.positionAlign = "center";
        testingStore.dispatch(updateCues([{ vttCue, cueCategory: "DIALOGUE" }]) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} vttCue={vttCue} cueCategory="DIALOGUE" />
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

    it("adds cue when ENTER is pressed on last cue", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        testingStore.dispatch(updateCues([{ vttCue, cueCategory: "DIALOGUE" }]) as {} as AnyAction);
        mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} vttCue={vttCue} cueCategory="DIALOGUE" />
            </Provider>
        );

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ENTER });


        // THEN
        expect(testingStore.getState().cues.length).toEqual(2);
        expect(testingStore.getState().editingCueIndex).toEqual(1);
    });

    it("closes cue editing mode when ENTER is pressed on non-last cue", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} vttCue={cues[0].vttCue} cueCategory="DIALOGUE" />
            </Provider>
        );

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ENTER });


        // THEN
        expect(testingStore.getState().cues.length).toEqual(2);
        expect(testingStore.getState().editingCueIndex).toEqual(-1);
    });

    it("closes cue editing mode when ESCAPE is pressed", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        testingStore.dispatch(updateCues([{ vttCue, cueCategory: "DIALOGUE" }]) as {} as AnyAction);
        mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} vttCue={vttCue} cueCategory="DIALOGUE" />
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
