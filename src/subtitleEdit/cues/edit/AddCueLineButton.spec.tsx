import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import AddCueLineButton from "./AddCueLineButton";
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
                <AddCueLineButton cueIndex={0} vttCue={vttCue} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("adds cue when clicked", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        testingStore.dispatch(updateCues([{ vttCue, cueCategory: "DIALOGUE" }]));
        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} vttCue={vttCue} />
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
        testingStore.dispatch(updateCues([{ vttCue, cueCategory: "AUDIO_DESCRIPTION" }]));
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
        testingStore.dispatch(updateCues([{ vttCue, cueCategory: "DIALOGUE" }]));
        const actualNode = mount(
            <Provider store={testingStore}>
                <AddCueLineButton cueIndex={0} vttCue={vttCue} />
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
});
