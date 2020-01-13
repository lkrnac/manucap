import "../testUtils/initBrowserEnvironment";

import videojs, { VideoJsPlayer } from "video.js";
import React from "react";
import { Track } from "./model";
import VideoPlayer from "./VideoPlayer";
import { mount } from "enzyme";
import { removeVideoPlayerDynamicValue } from "../testUtils/testUtils";

interface FakeTrack {
    language: string;
    addCue(cue: TextTrackCue): void;
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
        const actualVideoView = mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]}/>);

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
        const actualNode = mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={tracks}/>);

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.options_.playbackRates).toEqual([ 0.5, 0.75, 1, 1.25 ]);
        expect(actualComponent.player.options_.fluid).toBeTruthy();
        expect(actualComponent.player.options_.tracks).toEqual(expectedTextTrackOptions);
    });

    it("initializes videoJs with mp4 and poster URLs", () => {
        // WHEN
        const actualNode = mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]}/>);

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.src()).toEqual("dummyMp4Url");
        expect(actualComponent.player.poster()).toEqual("dummyPosterUrl");
    });

    it("initializes tracks content", () => {
        // GIVEN
        const initialTestingTracks = [
            {
                type: "CAPTION",
                language: { id: "en-CA" },
                default: true,
                currentVersion: { cues: [
                        new VTTCue(0, 1, "Caption Line 1"),
                        new VTTCue(1, 2, "Caption Line 2"),
                    ]}
            },
            {
                type: "TRANSLATION",
                language: { id: "es-ES" },
                default: false,
                currentVersion: { cues: [
                        new VTTCue(0, 1, "Translation Line 1"),
                        new VTTCue(1, 2, "Translation Line 2"),
                    ]}
            }
        ] as Track[];
        const textTracks = [
            { language: "en-CA", addCue: jest.fn() },
            { language: "es-ES", addCue: jest.fn() }
        ];
        const actualNode = mount(
            <VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={initialTestingTracks}/>
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
});
