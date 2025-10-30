import "../../testUtils/initBrowserEnvironment";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import EditingVideoPlayer from "./EditingVideoPlayer";
import { CueDto, Track } from "../model";
import { playVideoSection } from "./playbackSlices";
import { createTestingStore } from "../../testUtils/testingStore";
import { updateEditingTrack } from "../trackSlices";
import { updateCues, updateVttCue, } from "../cues/cuesList/cuesListActions";
import { render } from "@testing-library/react";
import { act, ReactElement } from "react";
import { saveCueUpdateSlice } from "../cues/saveCueUpdateSlices";
import { VideoPlayerProps } from "./VideoPlayer";

// I know this is anti-pattern, but it is very hard to test video.js with such old implementation of React integration
let videoPlayerPropsHistory: VideoPlayerProps[] = [];
let currentProps = {} as VideoPlayerProps;
jest.mock("./VideoPlayer", () => (videoPlayerProps: VideoPlayerProps): ReactElement => {
    videoPlayerPropsHistory.push(videoPlayerProps);
    currentProps = videoPlayerProps;
    return <div>VideoPlayer</div>
});

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

const updateCueMock = jest.fn();

describe("EditingVideoPlayer", () => {
    beforeEach(() => {
        videoPlayerPropsHistory = [];
        currentProps = {} as VideoPlayerProps;
        testingStore = createTestingStore();
        testingStore.dispatch(saveCueUpdateSlice.actions.setUpdateCueCallback(updateCueMock));
    });
    afterEach(() => {
        jest.resetAllMocks();
    });

    it("passes down new video section to play", async () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const component = (
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        )
        const actualNode = render(component);

        // WHEN
        await act(async () => {
            testingStore.dispatch(playVideoSection(2, 3) as {} as AnyAction);
            actualNode.rerender(component);
        });

        // THEN
        expect(currentProps.playSection).toEqual({ startTime: 2, endTime: 3 });
    });

    it("passes down last cue change when updated", async () => {
        // GIVEN
        const handleTimeChange = jest.fn();
        const component = (
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" onTimeChange={handleTimeChange} />
            </Provider>
        );
        const actualNode = render(component);

        // WHEN
        await act(async () => {
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const editUuid = testingStore.getState().cues[0].editUuid;
            testingStore.dispatch(updateVttCue(0, new VTTCue(0, 1, "Cue"), editUuid) as {} as AnyAction);
            actualNode.rerender(component);
        });

        // THEN
        const cueChange = videoPlayerPropsHistory[videoPlayerPropsHistory.length - 2].lastCueChange!;
        expect(cueChange.changeType).toEqual("EDIT");
        expect(cueChange.index).toEqual(0);
        expect(cueChange.vttCue?.text).toEqual("Cue");
        expect(cueChange.vttCue?.startTime).toEqual(0);
        expect(cueChange.vttCue?.endTime).toEqual(1);

        const lastCueChange = videoPlayerPropsHistory[videoPlayerPropsHistory.length - 1].lastCueChange!;
        expect(lastCueChange).toEqual(null);
    });

    it("clears last editing change state after it is updated in video player", async () => {
        // GIVEN
        const handleTimeChange = jest.fn();
        render(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" onTimeChange={handleTimeChange} />
            </Provider>
        );

        // WHEN
        await act(async () => {
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const editUuid = testingStore.getState().cues[0].editUuid;
            testingStore.dispatch(updateVttCue(0, new VTTCue(0, 1, "Cue"), editUuid) as {} as AnyAction);
        });

        // THEN
        expect(testingStore.getState().lastCueChange).toBeNull();
    });


    it("passes down cues array with correct language when first rendered", () => {
        // GIVEN
        const handleTimeChange = jest.fn();
        const expectedLanguageCuesArray = [
            {
                languageId: "en-US",
                cues: [
                    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
                    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
                ]
            }
        ];

        // WHEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        render(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" onTimeChange={handleTimeChange} />
            </Provider>
        );

        // THEN
        const languageCuesArray = currentProps.languageCuesArray;
        expect(languageCuesArray[0].cues[0].vttCue).toEqual(expectedLanguageCuesArray[0].cues[0].vttCue);
        expect(languageCuesArray[0].cues[1].vttCue).toEqual(expectedLanguageCuesArray[0].cues[1].vttCue);
    });

    it("passes down correct properties when updated", () => {
        // GIVEN
        const handleTimeChange = jest.fn();
        const component = (
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" onTimeChange={handleTimeChange} />
            </Provider>
        );
        const actualNode = render(component);

        // WHEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        actualNode.rerender(component);

        // THEN
        expect(currentProps.mp4).toEqual("dummyMp4");
        expect(currentProps.poster).toEqual("dummyPoster");
        expect(currentProps.tracks[0]).toEqual(testingTrack);
        expect(currentProps.tracks.length).toEqual(1);
        expect(currentProps.onTimeChange).toEqual(handleTimeChange);
    });
});
