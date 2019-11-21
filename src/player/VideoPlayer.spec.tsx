// @ts-ignore I couldn't come up with syntax that would be fine for this import
import * as jsdomGlobal from "jsdom-global";
jsdomGlobal();

// Simulate window resize event
const resizeEvent = document.createEvent("Event");
resizeEvent.initEvent("resize", true, true);

// @ts-ignore - Not sure how to get rid of this
const window = global.window;
window.resizeTo = (width: number, height: number) => {
    window.innerWidth = width ||  window.innerWidth;
    window.innerHeight = height ||  window.innerHeight;
    window.dispatchEvent(resizeEvent);
};

import * as enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import each from "jest-each";
import * as React from "react";
// @ts-ignore - We are mocking this with jest
import { getParentOffsetWidth } from "../htmlUtils";
import { removeVideoPlayerDynamicValue } from "../testUtils";
import VideoPlayer from "./VideoPlayer";

enzyme.configure({ adapter: new Adapter() });

describe("VideoPlayer", () => {
    it("renders", () => {
        // GIVEN
        // noinspection HtmlUnknownTarget Dummy URL is OK for testing
        const expectedVideoView = enzyme.mount(
            <video
                style={{ margin: "auto" }}
                className="vjs-tech"
                id="testvpid_html5_api"
                poster="dummyPosterUrl"
                preload="none"
                data-setup="{}"
                tabIndex={-1}
            />
        );

        // WHEN
        const actualVideoView = enzyme.mount(<VideoPlayer id="testvpid" poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualVideoView.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedVideoView.html()));
    });

    it("initializes videoJs with correct playback rates", () => {
        // WHEN
        const actualNode = enzyme.mount(<VideoPlayer id="testvpid" poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.options_.playbackRates).toEqual([ 0.5, 0.75, 1, 1.25 ]);
    });

    it("initializes videoJs with correct playback rates", () => {
        // GIVEN
        const actualNode = enzyme.mount(<VideoPlayer id="testvpid" poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // WHEN
        actualNode.setProps({ poster: "newPosterUrl", mp4: "newMp4Url" });

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.src()).toEqual("newMp4Url");
        expect(actualComponent.player.poster()).toEqual("newPosterUrl");
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
                    id="testvpid"
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    viewportHeightPerc={viewPostHeightPerc}
                />
            );

            // @ts-ignore // We are mocking here
            getParentOffsetWidth = jest.fn().mockReturnValue(offsetWidth);

            // WHEN
            window.resizeTo(width, height);

            // THEN
            // @ts-ignore - restoring original function
            getParentOffsetWidth.mockRestore();
            const actualComponent = actualNode.instance() as VideoPlayer;
            expect(actualComponent.player.width()).toEqual(expectedWidth);
            expect(actualComponent.player.height()).toEqual(expectedHeight);
    });
});
