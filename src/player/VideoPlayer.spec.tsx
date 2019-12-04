import "../initBrowserEnvironment";

import * as enzyme from "enzyme";
import each from "jest-each";
import * as React from "react";
import * as htmlUtils from "../htmlUtils";
import { removeVideoPlayerDynamicValue } from "../testUtils";
import VideoPlayer from "./VideoPlayer";

jest.mock("../htmlUtils");

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

    it("initializes videoJs with correct playback rates", () => {
        // WHEN
        const actualNode = enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.options_.playbackRates).toEqual([ 0.5, 0.75, 1, 1.25 ]);
    });

    it("initializes videoJs with mp4 and poster URLs", () => {
        // WHEN
        const actualNode = enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.src()).toEqual("dummyMp4Url");
        expect(actualComponent.player.poster()).toEqual("dummyPosterUrl");
    });

    each([
        [800, 600, 400, 0.5, 400, 225],
        [800, 600, 700, 0.5, 533.3333333333333, 300],
    ]).it(
        "resize work correctly for new window width: %i and height %i and offsetWidth %i",
        (width, height, offsetWidth, viewPostHeightPerc, expectedWidth, expectedHeight) => {
            // GIVEN
            const actualNode = enzyme.mount(
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    viewportHeightPerc={viewPostHeightPerc}
                />
            );

            // @ts-ignore We mocked the module (notice __mocks__ directory)
            htmlUtils.getParentOffsetWidth.mockReturnValue(offsetWidth);

            // WHEN
            window.resizeTo(width, height);

            // THEN
            const actualComponent = actualNode.instance() as VideoPlayer;
            expect(actualComponent.player.width()).toEqual(expectedWidth);
            expect(actualComponent.player.height()).toEqual(expectedHeight);
    });
});
