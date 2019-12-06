import "../initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import { removeVideoPlayerDynamicValue } from "../testUtils";
import VideoPlayer from "./VideoPlayer";

describe("VideoPlayer", () => {
    it("renders", () => {
        // GIVEN
        // noinspection HtmlUnknownTarget Dummy URL is OK for testing
        const expectedVideoView = enzyme.mount(
            <video
                style={{ margin: "auto" }}
                className="vjs-tech"
                poster="dummyPosterUrl"
                preload="none"
                data-setup="{}"
                id="vjs_video_3_html5_api"
                tabIndex={-1}
            />
        );

        // WHEN
        const actualVideoView = enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualVideoView.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedVideoView.html()));
    });

    it("initializes videoJs with correct options", () => {
        // WHEN
        const actualNode = enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.options_.playbackRates).toEqual([ 0.5, 0.75, 1, 1.25 ]);
        expect(actualComponent.player.options_.fluid).toBeTruthy();
    });

    it("initializes videoJs with mp4 and poster URLs", () => {
        // WHEN
        const actualNode = enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.src()).toEqual("dummyMp4Url");
        expect(actualComponent.player.poster()).toEqual("dummyPosterUrl");
    });
});
