import "../initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import { removeVideoPlayerDynamicValue } from "../testUtils";
import VideoPlayer from "./VideoPlayer";
import videojs from "video.js";
import {Track} from "./model";

describe("VideoPlayer", () => {
    it("renders", () => {
        // GIVEN
        // noinspection HtmlUnknownTarget Dummy URL is OK for testing
        const expectedVideoView = enzyme.mount(
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
        const actualVideoView = enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]}/>);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualVideoView.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedVideoView.html()));
    });

    it("initializes videoJs with correct options", () => {
        // GIVEN
        const tracks = [
            { type: "CAPTION", language: { id: "en-US" }, default: true} as Track,
            { type: "TRANSLATION", language: { id: "es-ES" }, default: false } as Track
        ];
        const expectedTextTrackOptions = [
            {kind: "captions", mode: "showing", srclang: "en-US", default: true} as videojs.TextTrackOptions,
            {kind: "subtitles", mode: "showing", srclang: "es-ES", default: false} as videojs.TextTrackOptions
        ];

        // WHEN
        const actualNode = enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={tracks}/>);

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.options_.playbackRates).toEqual([ 0.5, 0.75, 1, 1.25 ]);
        expect(actualComponent.player.options_.fluid).toBeTruthy();
        expect(actualComponent.player.options_.tracks).toEqual(expectedTextTrackOptions);
    });

    it("initializes videoJs with mp4 and poster URLs", () => {
        // WHEN
        const actualNode = enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]}/>);

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.src()).toEqual("dummyMp4Url");
        expect(actualComponent.player.poster()).toEqual("dummyPosterUrl");
    });
});
