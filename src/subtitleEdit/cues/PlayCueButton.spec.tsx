import "../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { CueDto } from "../model";
import PlayCueButton from "./PlayCueButton";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import testingStore from "../../testUtils/testingStore";

const testCue = { vttCue: new VTTCue(2, 3, "some text"), cueCategory: "DIALOGUE" } as CueDto;

describe("PlayCueButton", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <button
                style={{ maxHeight: "38px", margin: "5px" }}
                className="btn btn-outline-secondary"
            >
                <i className="fa fa-play" />
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <PlayCueButton cue={testCue} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("plays cue when play cue button is clicked", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <PlayCueButton cue={testCue} />
            </Provider>
        );

        // WHEN
        actualNode.find("button").simulate("click");

        // THEN
        expect(testingStore.getState().videoSectionToPlay).toEqual({ startTime: 2, endTime: 2.999 });
    });
});
