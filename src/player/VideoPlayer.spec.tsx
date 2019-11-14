// @ts-ignore I couldn't come up with syntax that would be fine for this import
import * as jsdomGlobal from "jsdom-global";
jsdomGlobal();

import { expect } from "chai";
import * as enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";
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
            .to.deep.equal(removeVideoPlayerDynamicValue(expectedVideoView.html()));
    });

    it("initializes videoJs with correct playback rates", () => {
        // WHEN
        const actualNode = enzyme.mount(<VideoPlayer id="testvpid" poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.options_.playbackRates).to.deep.equal([ 0.5, 0.75, 1, 1.25 ]);
    });

    it("initializes videoJs with correct playback rates", () => {
        // GIVEN
        const actualNode = enzyme.mount(<VideoPlayer id="testvpid" poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // WHEN
        actualNode.setProps({ poster: "newPosterUrl", mp4: "newMp4Url" });

        // THEN
        const actualComponent = actualNode.instance() as VideoPlayer;
        expect(actualComponent.player.src()).to.equal("newMp4Url");
        expect(actualComponent.player.poster()).to.equal("newPosterUrl");
    });

});
