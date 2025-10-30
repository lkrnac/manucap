import "../../testUtils/initBrowserEnvironment";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";

import EditingVideoPlayer from "./EditingVideoPlayer";
import { CueDto, Track } from "../model";
import { createTestingStore } from "../../testUtils/testingStore";
import { updateEditingTrack } from "../trackSlices";
import { saveCueUpdateSlice } from "../cues/saveCueUpdateSlices";
import { act } from "react";
import { updateCues, updateVttCue } from "../cues/cuesList/cuesListActions";
import { waveformVisibleSlice } from "./waveformSlices";
import { playVideoSection } from "./playbackSlices";

let testingStore = createTestingStore();

const testingCues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
    timecodesUnlocked: true
} as Track;

// @ts-ignore we are just mocking
jest.spyOn(global, "fetch").mockResolvedValue({
    json: jest.fn().mockResolvedValue({
        data: [0,-1,0,-1,4,-6,4,-3,4,-1,3,-3,3,-5,4,-1,6,-8,1,0,5,-3,0,-2,1,0,4]
    })
});

const updateCueMock = jest.fn();

describe("EditingVideoPlayer", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(saveCueUpdateSlice.actions.setUpdateCueCallback(updateCueMock));
    });

    it("renders without player if track is not defined", () => {
        // GIVEN
        const expectedNode = render(<p>Editing track not available!</p>);

        // WHEN
        const actualNode = render(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders with player if track is defined", async () => {
        // GIVEN
        // noinspection HtmlUnknownTarget
        const expectedNode = render(
            <video
                id="video-player_html5_api"
                style={{ margin: "auto" }}
                className="vjs-tech"
                poster="dummyPoster"
                preload="none"
                data-setup="{}"
                tabIndex={-1}
            />
        );
        const component = (
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        );
        const actualNode = render(component);

        // WHEN
        await act(async () => {
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            actualNode.rerender(component);
        });

        // THEN
        const videoNode = actualNode.container.querySelector("video")!;
        expect(videoNode.outerHTML).toEqual(expectedNode.container.innerHTML);
    });

    it("adjust new player time to negative value so that it can be changed to same value again", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const component = (
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        );
        const actualNode = render(component);

        // WHEN
        testingStore.dispatch(playVideoSection(2) as {} as AnyAction);
        actualNode.rerender(component);

        // THEN
        expect(testingStore.getState().videoSectionToPlay).toEqual({ startTime: -1 });
    });

    it("enable waveform by default", async () => {
        // GIVEN
        const handleTimeChange = jest.fn();
        const component = (
            <Provider store={testingStore} >
                <EditingVideoPlayer
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    waveform="dummyWaveform"
                    mediaLength={1801000}
                    onTimeChange={handleTimeChange}
                />
            </Provider>
        );
        const actualNode = render(component);

        // WHEN
        await act(async () => {
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            actualNode.rerender(component)
        });

        // THEN
        expect(testingStore.getState().waveformVisible).toBeTruthy();
    });

    // TODO: This test case is not clear after migration from enzyme
    it("updates cues timecodes when waveform regions are manually updated", async () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(waveformVisibleSlice.actions.setWaveformVisible(true));
        const component = (
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" waveform="dummyWaveform" mediaLength={120000} />
            </Provider>
        );
        const actualNode = render(component);
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            actualNode.rerender(component);
        });

        // WHEN
        // Simulate the updateCueTimecodes callback being called (as would happen from waveform region-update-end event)
        const cues = testingStore.getState().cues;
        const existingCue = cues[1];
        const newCue = new VTTCue(1, 3.4567, existingCue.vttCue.text);
        testingStore.dispatch(updateVttCue(1, newCue, existingCue.editUuid) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1");
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(3.4567);
    });
});
