import "../testUtils/initBrowserEnvironment";

import { LanguageCues, Track } from "../subtitleEdit/model";
import videojs, { VideoJsPlayer } from "video.js";
import React from "react";
import VideoPlayer from "./VideoPlayer";
import { copyNonConstructorProperties } from "../subtitleEdit/cues/edit/cueUtils";
import { mount } from "enzyme";
import { removeVideoPlayerDynamicValue } from "../testUtils/testUtils";

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
        const actualVideoView = mount(
            <VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]} languageCuesArray={[]} />
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
            <VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={tracks} languageCuesArray={[]} />
        );

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.options_.playbackRates).toEqual([ 0.5, 0.75, 1, 1.25 ]);
        expect(actualComponent.player.options_.fluid).toBeTruthy();
        expect(actualComponent.player.options_.tracks).toEqual(expectedTextTrackOptions);
    });

    it("initializes videoJs with mp4 and poster URLs", () => {
        // WHEN
        const actualNode = mount(
            <VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]} languageCuesArray={[]} />
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
            { language: "en-CA", addCue: jest.fn(), cues: [ new VTTCue(0, 1, "Caption Line 1") ]},
        ];
        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={initialTestingTracks}
                languageCuesArray={languageCuesArray}
            />
        );
        const component = actualNode.instance() as VideoPlayer;

        // WHEN
        dispatchEventForTrack(component.player, textTracks[0]);

        // THEN
        expect(copyNonConstructorProperties).toBeCalledWith(new VTTCue(0, 1, "Caption Line 1"), vttCue);
    });
});
