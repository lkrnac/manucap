import "../../testUtils/initBrowserEnvironment";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import React from "react";
import "@testing-library/jest-dom/extend-expect";

import EditingVideoPlayer from "./EditingVideoPlayer";
import { CueDto, Track } from "../model";
import VideoPlayer from "./VideoPlayer";
import { playVideoSection } from "./playbackSlices";
import { mount } from "enzyme";
import testingStore from "../../testUtils/testingStore";
import { updateEditingTrack } from "../trackSlices";
import { updateCues, updateVttCue, } from "../cues/cueSlices";

jest.mock("./VideoPlayer");

// @ts-ignore We are mocking module
VideoPlayer.mockClear();

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
} as Track;

const testingCues = [
    { vttCue: new VTTCue(0, 1.225, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1.225, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

describe("EditingVideoPlayer", () => {
    it("passes down new video section to play", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(playVideoSection(2, 3) as {} as AnyAction);
        actualNode.update();

        // THEN
        expect(actualNode.find(VideoPlayer).props().playSection).toEqual({ startTime: 2, endTime: 3 });
    });

    it("passes down last cue change when updated", () => {
        // GIVEN
        const handleTimeChange = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" onTimeChange={handleTimeChange} />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(updateVttCue(0, new VTTCue(0, 1, "Cue")) as {} as AnyAction);
        actualNode.setProps({}); // trigger update + re-render

        // THEN
        expect(actualNode.find(VideoPlayer).props().lastCueChange)
            .toEqual({ changeType: "EDIT", index: 0, vttCue: new VTTCue(0, 1, "Cue") });
    });
});
