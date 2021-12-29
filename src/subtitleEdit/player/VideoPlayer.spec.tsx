import "../../testUtils/initBrowserEnvironment";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";

import { CueDto, LanguageCues, Track } from "../model";
import videojs, { VideoJsPlayer } from "video.js";
import { Character } from "../utils/shortcutConstants";
import VideoPlayer from "./VideoPlayer";
import { copyNonConstructorProperties, isSafari } from "../cues/cueUtils";
import { mount } from "enzyme";
import { removeVideoPlayerDynamicValue } from "../../testUtils/testUtils";
import sinon from "sinon";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import { act } from "react-dom/test-utils";

jest.mock("../cues/cueUtils");

let testingStore = createTestingStore();

const cues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
] as CueDto[];

const tracks = [
    { type: "CAPTION", language: { id: "en-US" }, default: true } as Track,
    { type: "TRANSLATION", language: { id: "es-ES" }, default: false } as Track
];

interface FakeTrack {
    language: string;
    addCue(vttCue: TextTrackCue): void;
}

const dispatchEventForTrack = (player: VideoJsPlayer, textTrack: FakeTrack): void => {
    const trackEventEn = new Event("addtrack") as TrackEvent;
    // @ts-ignore We need to force this for testing
    // noinspection JSConstantReassignment
    trackEventEn.track = textTrack;
    player.textTracks().dispatchEvent(trackEventEn);
};

describe("VideoPlayer", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    it("renders", () => {
        // GIVEN
        // noinspection HtmlUnknownTarget Dummy URL is OK for testing
        const expectedVideoView = mount(
            <video
                id="video-player_html5_api"
                style={{ margin: "auto" }}
                className="vjs-tech"
                poster="dummyPosterUrl"
                preload="none"
                data-setup="{}"
                tabIndex={-1}
            />
        );

        // WHEN
        const actualVideoView = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    tracks={[]}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );
        const videoNode = actualVideoView.find("video");

        // THEN
        expect(removeVideoPlayerDynamicValue(videoNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedVideoView.html()));
    });

    it("initializes videoJs with correct options (non safari)", () => {
        // GIVEN
        const expectedTextTrackOptions = [
            { kind: "captions", mode: "showing", srclang: "en-US", default: true } as videojs.TextTrackOptions,
            { kind: "subtitles", mode: "showing", srclang: "es-ES", default: false } as videojs.TextTrackOptions
        ];

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    tracks={tracks}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;
        expect(actualComponent.player.options_.playbackRates).toEqual([0.5, 0.75, 1, 1.25]);
        expect(actualComponent.player.options_.fluid).toBeTruthy();
        expect(actualComponent.player.options_.html5.nativeTextTracks).toBeUndefined();
        expect(actualComponent.player.options_.tracks).toEqual(expectedTextTrackOptions);
        expect(actualComponent.player.options_.aspectRatio).toEqual("16:9");
    });

    it("initializes videoJs with correct options (safari)", () => {
        // GIVEN
        // @ts-ignore
        isSafari.mockImplementationOnce(() => true);
        const expectedTextTrackOptions = [
            { kind: "captions", mode: "showing", srclang: "en-US", default: true } as videojs.TextTrackOptions,
            { kind: "subtitles", mode: "showing", srclang: "es-ES", default: false } as videojs.TextTrackOptions
        ];

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    tracks={tracks}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;
        expect(actualComponent.player.options_.playbackRates).toEqual([0.5, 0.75, 1, 1.25]);
        expect(actualComponent.player.options_.fluid).toBeTruthy();
        expect(actualComponent.player.options_.html5.nativeTextTracks).toBeFalsy();
        expect(actualComponent.player.options_.tracks).toEqual(expectedTextTrackOptions);
        expect(actualComponent.player.options_.aspectRatio).toEqual("16:9");
    });

    it("initializes videoJs with mp4 and poster URLs", () => {
        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    tracks={[]}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;
        expect(actualComponent.player.src()).toEqual("dummyMp4Url");
        expect(actualComponent.player.poster()).toEqual("dummyPosterUrl");
    });

    it("initializes tracks content", () => {
        // GIVEN
        const captionCues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ];
        const translationCues = [
            { vttCue: new VTTCue(0, 1, "Translation Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Translation Line 2"), cueCategory: "DIALOGUE" },
        ];
        const languageCuesArray = [
            { languageId: "en-CA", cues: captionCues },
            { languageId: "es-ES", cues: translationCues },
        ] as LanguageCues[];
        const initialTestingTracks = [
            { type: "CAPTION", language: { id: "en-CA" }, default: true },
            { type: "TRANSLATION", language: { id: "es-ES" }, default: false }
        ] as Track[];
        const textTracks = [
            { language: "en-CA", addCue: jest.fn(), cues: captionCues },
            { language: "es-ES", addCue: jest.fn(), cues: translationCues }
        ];
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    tracks={initialTestingTracks}
                    languageCuesArray={languageCuesArray}
                    lastCueChange={null}
                />
            </Provider>
        );
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const component = videoNode.instance() as VideoPlayer;

        // WHEN
        dispatchEventForTrack(component.player, textTracks[0]);
        dispatchEventForTrack(component.player, textTracks[1]);

        // THEN
        expect(textTracks[0].addCue).nthCalledWith(1, new VTTCue(0, 1, "Caption Line 1"));
        expect(textTracks[0].addCue).nthCalledWith(2, new VTTCue(1, 2, "Caption Line 2"));
        expect(textTracks[1].addCue).nthCalledWith(1, new VTTCue(0, 1, "Translation Line 1"));
        expect(textTracks[1].addCue).nthCalledWith(2, new VTTCue(1, 2, "Translation Line 2"));
    });

    it("initializes wavesurfer with correct options", async () => {
        // GIVEN
        // @ts-ignore we are just mocking
        jest.spyOn(global, "fetch").mockResolvedValue({
            json: jest.fn().mockResolvedValue({
                data: [0,-1,0,-1,4,-6,4,-3,4,-1,3,-3,3,-5,4,-1,6,-8,1,0,5,-3,0,-2,1,0,4]
            })
        });

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    waveform="dummyWaveform"
                    duration={20}
                    tracks={tracks}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 500)));

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.params.normalize).toBeTruthy();
        expect(actualComponent.wavesurfer.params.scrollParent).toBeTruthy();
        expect(actualComponent.wavesurfer.params.minimap).toBeTruthy();
        expect(actualComponent.wavesurfer.params.backend).toEqual("MediaElement");
        expect(actualComponent.wavesurfer.params.height).toEqual(200);
        expect(actualComponent.wavesurfer.params.pixelRatio).toEqual(1);
        expect(actualComponent.wavesurfer.params.barHeight).toEqual(0.4);
        expect(actualComponent.wavesurfer.params.plugins.length).toEqual(3);
        expect(actualComponent.wavesurfer.params.plugins[0].name).toEqual("regions");
        expect(actualComponent.wavesurfer.params.plugins[1].name).toEqual("minimap");
        expect(actualComponent.wavesurfer.params.plugins[2].name).toEqual("timeline");
        expect(actualComponent.wavesurfer.initialisedPluginList).toEqual(
            { regions: true, minimap: true, timeline: true });
        expect(actualComponent.wavesurfer.regions.params).toEqual({ dragSelection: false });
        expect(actualComponent.wavesurfer.minimap.params.height).toEqual(50);
    });

    it("initializes wavesurfer with regions", async () => {
        // GIVEN
        // @ts-ignore we are just mocking
        jest.spyOn(global, "fetch").mockResolvedValue({
            json: jest.fn().mockResolvedValue({
                data: [0,-1,0,-1,4,-6,4,-3,4,-1,3,-3,3,-5,4,-1,6,-8,1,0,5,-3,0,-2,1,0,4]
            })
        });

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    waveform="dummyWaveform"
                    duration={20}
                    cues={cues}
                    tracks={tracks}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 500)));

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
        expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 1");
        expect(actualComponent.wavesurfer.regions.list[1].start).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[1].end).toEqual(4);
        expect(actualComponent.wavesurfer.regions.list[1].attributes.label).toEqual("Caption Line 2");
    });

    it("maintains cue styles when tracks are initialized", () => {
        // GIVEN
        // @ts-ignore
        copyNonConstructorProperties.mockImplementationOnce(() => jest.fn());
        const vttCue = new VTTCue(0, 1, "Caption Line 1");
        vttCue.align = "start";
        vttCue.position = 60;
        const cue = { vttCue: vttCue, cueCategory: "DIALOGUE" };
        const languageCuesArray = [
            { languageId: "en-CA", cues: [cue]},
        ] as LanguageCues[];

        const initialTestingTracks = [
            {
                type: "CAPTION",
                language: { id: "en-CA" },
                default: true,
            }
        ] as Track[];
        const textTracks = [
            { language: "en-CA", addCue: jest.fn(), cues: [new VTTCue(0, 1, "Caption Line 1")]},
        ];
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    tracks={initialTestingTracks}
                    languageCuesArray={languageCuesArray}
                    lastCueChange={null}
                />
            </Provider>
        );
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const component = videoNode.instance() as VideoPlayer;

        // WHEN
        dispatchEventForTrack(component.player, textTracks[0]);

        // THEN
        expect(copyNonConstructorProperties).toBeCalledWith(new VTTCue(0, 1, "Caption Line 1"), vttCue);
    });

    it("should toggle play/pause with key shortcut", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    tracks={[]}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;
        const playPauseSpy = sinon.spy();
        actualComponent.playPause = playPauseSpy;

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: Character.O_CHAR, shiftKey: true, altKey: true });
        simulant.fire(document.documentElement, "keydown", { keyCode: Character.O_CHAR, shiftKey: true, altKey: true });

        // THEN
        sinon.assert.calledTwice(playPauseSpy);
    });

    it("should shiftTime -1 second with key shortcut", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    tracks={[]}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;
        const shiftTimeSpy = sinon.spy();
        actualComponent.shiftTime = shiftTimeSpy;

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ARROW_LEFT, shiftKey: true, altKey: true });

        // THEN
        sinon.assert.calledWith(shiftTimeSpy, -1000);
    });

    it("should call shiftTime 1 second with key shortcut", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    tracks={[]}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;
        const shiftTimeSpy = sinon.spy();
        actualComponent.shiftTime = shiftTimeSpy;

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ARROW_RIGHT, shiftKey: true, altKey: true });

        // THEN
        sinon.assert.calledWith(shiftTimeSpy, 1000);
    });

    it("should call onTimeChange on player timeupdate event", () => {
        // GIVEN
        const onTimeChange = sinon.spy();
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    tracks={[]}
                    onTimeChange={onTimeChange}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        // WHEN
        actualComponent.player.trigger("timeupdate");

        // THEN
        sinon.assert.calledOnce(onTimeChange);
    });

    it("should work correctly after player timeupdate event when no onTimeChange prop is provided", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    tracks={[]}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;
        const playPauseSpy = sinon.spy();
        actualComponent.playPause = playPauseSpy;

        // WHEN
        actualComponent.player.trigger("timeupdate");
        simulant.fire(document.documentElement, "keydown", { keyCode: Character.O_CHAR, shiftKey: true, altKey: true });

        // THEN
        sinon.assert.calledOnce(playPauseSpy);
    });

    it("customizes cues positions on track load", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "Caption Line 1");
        vttCue.line = 12;
        const captionCues = [
            { vttCue: vttCue, cueCategory: "DIALOGUE" },
        ];
        const languageCuesArray = [
            { languageId: "en-CA", cues: captionCues },
        ] as LanguageCues[];
        const initialTestingTracks = [
            { type: "CAPTION", language: { id: "en-CA" }, default: true },
        ] as Track[];
        const textTracks = [
            { language: "en-CA", addCue: jest.fn(), cues: [vttCue]},
        ];
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    tracks={initialTestingTracks}
                    languageCuesArray={languageCuesArray}
                    lastCueChange={null}
                    trackFontSizePercent={1.25}
                />
            </Provider>
        );
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const component = videoNode.instance() as VideoPlayer;

        // WHEN
        dispatchEventForTrack(component.player, textTracks[0]);

        // THEN
        expect(textTracks[0].cues[0].line).toEqual(10);
    });
});
