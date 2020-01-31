import "../testUtils/initBrowserEnvironment";
import * as shortcuts from "../utils/shortcutConstants";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import videojs, { VideoJsPlayer } from "video.js";
import React from "react";
import { Track } from "./model";
import VideoPlayer from "./VideoPlayer";
import { copyNonConstructorProperties } from "../subtitleEdit/cueUtils";
import { mount } from "enzyme";
import { removeVideoPlayerDynamicValue } from "../testUtils/testUtils";
import sinon from "sinon";

jest.mock("../subtitleEdit/cueUtils");

interface FakeTrack {
    language: string;
    addCue(vttCue: TextTrackCue): void;
}

const dispatchEventForTrack = (player: VideoJsPlayer, textTrack: FakeTrack): void => {
    const trackEventEn = new Event("addtrack") as TrackEvent;
    // @ts-ignore We need to force this for testing
    trackEventEn.track = textTrack;
    player.textTracks().dispatchEvent(trackEventEn);
};

describe("VideoPlayer", () => {
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
        const actualVideoView = mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]} />);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualVideoView.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedVideoView.html()));
    });

    it("initializes videoJs with correct options", () => {
        // GIVEN
        const tracks = [
            { type: "CAPTION", language: { id: "en-US" }, default: true } as Track,
            { type: "TRANSLATION", language: { id: "es-ES" }, default: false } as Track
        ];
        const expectedTextTrackOptions = [
            { kind: "captions", mode: "showing", srclang: "en-US", default: true } as videojs.TextTrackOptions,
            { kind: "subtitles", mode: "showing", srclang: "es-ES", default: false } as videojs.TextTrackOptions
        ];

        // WHEN
        const actualNode = mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={tracks} />);

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.options_.playbackRates).toEqual([ 0.5, 0.75, 1, 1.25 ]);
        expect(actualComponent.player.options_.fluid).toBeTruthy();
        expect(actualComponent.player.options_.tracks).toEqual(expectedTextTrackOptions);
    });

    it("initializes videoJs with mp4 and poster URLs", () => {
        // WHEN
        const actualNode = mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]} />);

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
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
        const initialTestingTracks = [
            {
                type: "CAPTION",
                language: { id: "en-CA" },
                default: true,
                currentVersion: { cues: captionCues }
            },
            {
                type: "TRANSLATION",
                language: { id: "es-ES" },
                default: false,
                currentVersion: { cues: translationCues }
            }
        ] as Track[];
        const textTracks = [
            { language: "en-CA", addCue: jest.fn(), cues: captionCues },
            { language: "es-ES", addCue: jest.fn(), cues: translationCues }
        ];
        const actualNode = mount(
            <VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={initialTestingTracks} />
        );
        const component = actualNode.instance() as VideoPlayer;

        // WHEN
        dispatchEventForTrack(component.player, textTracks[0]);
        dispatchEventForTrack(component.player, textTracks[1]);

        // THEN
        expect(textTracks[0].addCue).nthCalledWith(1, new VTTCue(0, 1, "Caption Line 1"));
        expect(textTracks[0].addCue).nthCalledWith(2, new VTTCue(1, 2, "Caption Line 2"));
        expect(textTracks[1].addCue).nthCalledWith(1, new VTTCue(0, 1, "Translation Line 1"));
        expect(textTracks[1].addCue).nthCalledWith(2, new VTTCue(1, 2, "Translation Line 2"));
    });

    it("maintains cue styles when tracks are initialized", () => {
        // GIVEN
        // @ts-ignore
        copyNonConstructorProperties.mockImplementationOnce(() => jest.fn());
        const vttCue = new VTTCue(0, 1, "Caption Line 1");
        vttCue.align = "start";
        vttCue.position = 60;
        const cue = { vttCue: vttCue, cueCategory: "DIALOGUE" };
        const initialTestingTracks = [
            {
                type: "CAPTION",
                language: { id: "en-CA" },
                default: true,
                currentVersion: { cues: [cue]}
            }
        ] as Track[];
        const textTracks = [
            { language: "en-CA", addCue: jest.fn(), cues: [ new VTTCue(0, 1, "Caption Line 1") ]},
        ];
        const actualNode = mount(
            <VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={initialTestingTracks} />
        );
        const component = actualNode.instance() as VideoPlayer;

        // WHEN
        dispatchEventForTrack(component.player, textTracks[0]);

        // THEN
        expect(copyNonConstructorProperties).toBeCalledWith(new VTTCue(0, 1, "Caption Line 1"), vttCue);
    });

    it("should toggle play/pause with key shortcut", () => {
        // GIVEN
        const actualNode = mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]} />);
        const actualComponent = actualNode.instance() as VideoPlayer;
        const playPauseSpy = sinon.spy();
        actualComponent.playPause = playPauseSpy;

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: shortcuts.O_CHAR, shiftKey: true, altKey: true });
        simulant.fire(document.documentElement, "keydown", { keyCode: shortcuts.O_CHAR, shiftKey: true, altKey: true });

        // THEN
        sinon.assert.calledTwice(playPauseSpy);
    });

    it("should shiftTime -1 second with key shortcut", () => {
        // GIVEN
        const actualNode = mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]} />);
        const actualComponent = actualNode.instance() as VideoPlayer;
        const shiftTimeSpy = sinon.spy();
        actualComponent.shiftTime = shiftTimeSpy;

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: shortcuts.ARROW_LEFT, shiftKey: true, altKey: true });

        // THEN
        sinon.assert.calledWith(shiftTimeSpy, -1000);
    });

    it("should call shiftTime 1 second with key shortcut", () => {
        // GIVEN
        const actualNode = mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]} />);
        const actualComponent = actualNode.instance() as VideoPlayer;
        const shiftTimeSpy = sinon.spy();
        actualComponent.shiftTime = shiftTimeSpy;

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: shortcuts.ARROW_RIGHT, shiftKey: true, altKey: true });

        // THEN
        sinon.assert.calledWith(shiftTimeSpy, 1000);
    });

    it("should call onTimeChange on player timeupdate event", () => {
        // GIVEN
        const onTimeChange = sinon.spy();
        const actualNode = mount(
            <VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]} onTimeChange={onTimeChange} />);
        const actualComponent = actualNode.instance() as VideoPlayer;

        // WHEN
        actualComponent.player.trigger("timeupdate");

        // THEN
        sinon.assert.calledOnce(onTimeChange);
    });
});
