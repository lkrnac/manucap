import "../../testUtils/initBrowserEnvironment";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { mount } from "enzyme";

import EditingVideoPlayer from "./EditingVideoPlayer";
import { CueDto, Track } from "../model";
import VideoPlayer from "./VideoPlayer";
import { playVideoSection } from "./playbackSlices";
import { createTestingStore } from "../../testUtils/testingStore";
import { updateCues } from "../cues/cuesList/cuesListActions";
import { updateEditingTrack } from "../trackSlices";

let testingStore = createTestingStore();

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
    timecodesUnlocked: true
} as Track;

const testingCues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

describe("EditingVideoPlayer", () => {
    beforeEach(() => testingStore = createTestingStore());

    it("renders without player if track is not defined", () => {
        // GIVEN
        const expectedNode = mount(<p>Editing track not available!</p>);

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with player if track is defined", () => {
        // GIVEN
        // noinspection HtmlUnknownTarget
        const expectedNode = mount(
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
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        actualNode.update();
        const videoNode = actualNode.find("video");

        // THEN
        expect(videoNode.html()).toEqual(expectedNode.html());
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
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" onTimeChange={handleTimeChange} />
            </Provider>
        );

        // THEN
        const languageCuesArray = actualNode.find(VideoPlayer).props().languageCuesArray;
        expect(languageCuesArray[0].cues[0].vttCue).toEqual(expectedLanguageCuesArray[0].cues[0].vttCue);
        expect(languageCuesArray[0].cues[1].vttCue).toEqual(expectedLanguageCuesArray[0].cues[1].vttCue);
    });

    it("passes down correct properties when updated", () => {
        // GIVEN
        const handleTimeChange = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" onTimeChange={handleTimeChange} />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        actualNode.setProps({}); // trigger update + re-render

        // THEN
        expect(actualNode.find(VideoPlayer).props().mp4).toEqual("dummyMp4");
        expect(actualNode.find(VideoPlayer).props().poster).toEqual("dummyPoster");
        expect(actualNode.find(VideoPlayer).props().tracks[0]).toEqual(testingTrack);
        expect(actualNode.find(VideoPlayer).props().tracks.length).toEqual(1);
        expect(actualNode.find(VideoPlayer).props().onTimeChange).toEqual(handleTimeChange);
    });

    it("adjust new player time to negative value so that it can be changed to same value again", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore} >
                <EditingVideoPlayer mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(playVideoSection(2) as {} as AnyAction);
        actualNode.setProps({}); // trigger update + re-render

        // THEN
        expect(actualNode.find(VideoPlayer).props().playSection).toEqual({ startTime: -1 });
    });
});
