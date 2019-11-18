// @ts-ignore I couldn't come up with syntax that would be fine for this import
import * as jsdomGlobal from "jsdom-global";
jsdomGlobal();

import * as enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import * as videojs from "video.js";
// @ts-ignore - We are mocking this with jest
import VideoPlayer from "./VideoPlayer";

jest.mock("video.js");
const oLetter = 79;

enzyme.configure({ adapter: new Adapter() });

describe("VideoPlayer", () => {
    it("executes play via keyboard shortcut", () => {
        // GIVEN
        const play = jest.fn();
        const playerMock = {
            el: () => ({ parentElement: undefined }),
            height: jest.fn(),
            paused: () => true,
            play,
            width: jest.fn(),
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        enzyme.mount(<VideoPlayer id="testvpid" poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: oLetter, shiftKey: true, altKey: true });

        // THEN
        expect(play).toBeCalled();
    });

    it("executes pause via keyboard shortcut", () => {
        // GIVEN
        const pause = jest.fn();
        const playerMock = {
            el: () => ({ parentElement: undefined }),
            height: jest.fn(),
            pause,
            paused: () => false,
            width: jest.fn(),
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        enzyme.mount(<VideoPlayer id="testvpid" poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: oLetter, shiftKey: true, altKey: true });

        // THEN
        expect(pause).toBeCalled();
    });
});
