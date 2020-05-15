import "../../testUtils/initBrowserEnvironment";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import React from "react";
import "@testing-library/jest-dom/extend-expect";

import EditingVideoPlayer from "./EditingVideoPlayer";
import { Track } from "../model";
import VideoPlayer from "./VideoPlayer";
import { playVideoSection } from "./playbackSlices";
import { mount } from "enzyme";
import testingStore from "../../testUtils/testingStore";
import { updateEditingTrack } from "../trackSlices";

jest.mock("./VideoPlayer");

// @ts-ignore We are mocking module
VideoPlayer.mockClear();

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
} as Track;

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
});
