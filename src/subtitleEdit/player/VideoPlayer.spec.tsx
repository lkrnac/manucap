import "../../testUtils/initBrowserEnvironment";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";

import { LanguageCues, Track } from "../model";
import videojs, { VideoJsPlayer } from "video.js";
import { Character } from "../shortcutConstants";
import React from "react";
import VideoPlayer from "./VideoPlayer";
import { copyNonConstructorProperties } from "../cues/cueUtils";
import { mount } from "enzyme";
import { removeVideoPlayerDynamicValue } from "../../testUtils/testUtils";
import sinon from "sinon";

jest.mock("../cues/cueUtils");

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
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={[]}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

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
        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.options_.playbackRates).toEqual([0.5, 0.75, 1, 1.25]);
        expect(actualComponent.player.options_.fluid).toBeTruthy();
        expect(actualComponent.player.options_.tracks).toEqual(expectedTextTrackOptions);
    });

    it("initializes videoJs with mp4 and poster URLs", () => {
        // WHEN
        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={[]}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

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
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={initialTestingTracks}
                languageCuesArray={languageCuesArray}
                lastCueChange={null}
            />
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
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={initialTestingTracks}
                languageCuesArray={languageCuesArray}
                lastCueChange={null}
            />
        );
        const component = actualNode.instance() as VideoPlayer;

        // WHEN
        dispatchEventForTrack(component.player, textTracks[0]);

        // THEN
        expect(copyNonConstructorProperties).toBeCalledWith(new VTTCue(0, 1, "Caption Line 1"), vttCue);
    });

    it("should toggle play/pause with key shortcut", () => {
        // GIVEN
        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={[]}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        const actualComponent = actualNode.instance() as VideoPlayer;
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
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={[]}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        const actualComponent = actualNode.instance() as VideoPlayer;
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
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={[]}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        const actualComponent = actualNode.instance() as VideoPlayer;
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
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={[]}
                onTimeChange={onTimeChange}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        const actualComponent = actualNode.instance() as VideoPlayer;

        // WHEN
        actualComponent.player.trigger("timeupdate");

        // THEN
        sinon.assert.calledOnce(onTimeChange);
    });

    it("should work correctly after player timeupdate event when no onTimeChange prop is provided", () => {
        // GIVEN
        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={[]}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        const actualComponent = actualNode.instance() as VideoPlayer;
        const playPauseSpy = sinon.spy();
        actualComponent.playPause = playPauseSpy;

        // WHEN
        actualComponent.player.trigger("timeupdate");
        simulant.fire(document.documentElement, "keydown", { keyCode: Character.O_CHAR, shiftKey: true, altKey: true });

        // THEN
        sinon.assert.calledOnce(playPauseSpy);
    });

    it("should set text settings when player is ready", () => {
        // GIVEN
        const settings = { setValues: jest.fn(), updateDisplay: jest.fn() };
        const expectedTextSettings = {
            "fontPercent": 1.25
        };

        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={[]}
                languageCuesArray={[]}
                lastCueChange={null}
                trackFontPercent={1.25}
            />
        );
        const actualComponent = actualNode.instance() as VideoPlayer;

        // @ts-ignore @types/video.js player is missing textTrackSettings check
        // https://www.npmjs.com/package/@types/video.js for updates
        actualComponent.player.textTrackSettings = settings;

        // WHEN
        actualComponent.player.trigger("ready");


        // THEN
        expect(settings.setValues).toBeCalledWith(expectedTextSettings);
        expect(settings.updateDisplay).toBeCalled();
    });

    it("should not set text settings if not passing fontpercent", () => {
        // GIVEN
        const settings = { setValues: jest.fn(), updateDisplay: jest.fn() };


        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={[]}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        const actualComponent = actualNode.instance() as VideoPlayer;

        // @ts-ignore @types/video.js player is missing textTrackSettings check
        // https://www.npmjs.com/package/@types/video.js for updates
        actualComponent.player.textTrackSettings = settings;

        // WHEN
        actualComponent.player.trigger("ready");


        // THEN
        expect(settings.setValues).not.toBeCalled();
        expect(settings.updateDisplay).not.toBeCalled();
    });

    it("should not set text settings if not passing 1.00 as fontpercent", () => {
        // GIVEN
        const settings = { setValues: jest.fn(), updateDisplay: jest.fn() };


        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={[]}
                languageCuesArray={[]}
                lastCueChange={null}
                trackFontPercent={1.00}
            />
        );
        const actualComponent = actualNode.instance() as VideoPlayer;

        // @ts-ignore @types/video.js player is missing textTrackSettings check
        // https://www.npmjs.com/package/@types/video.js for updates
        actualComponent.player.textTrackSettings = settings;

        // WHEN
        actualComponent.player.trigger("ready");


        // THEN
        expect(settings.setValues).not.toBeCalled();
        expect(settings.updateDisplay).not.toBeCalled();
    });

});
