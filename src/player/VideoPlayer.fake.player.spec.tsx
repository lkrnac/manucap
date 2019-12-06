import "../initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import * as videojs from "video.js";
import VideoPlayer from "./VideoPlayer";

jest.mock("video.js");
const O_CHAR = 79;
const LEFT = 37;
const RIGHT = 39;

describe("VideoPlayer", () => {
    it("executes play via keyboard shortcut", () => {
        // GIVEN
        const play = jest.fn();
        const playerMock = {
            el: (): object => ({ parentElement: undefined }),
            paused: (): boolean => true,
            play,
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: O_CHAR, shiftKey: true, altKey: true });

        // THEN
        expect(play).toBeCalled();
    });

    it("executes pause via keyboard shortcut", () => {
        // GIVEN
        const pause = jest.fn();
        const playerMock = {
            el: (): object => ({ parentElement: undefined }),
            pause,
            paused: (): boolean => false,
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: O_CHAR, shiftKey: true, altKey: true });

        // THEN
        expect(pause).toBeCalled();
    });

    it("shifts playback forward via keyboard shortcut", () => {
        // GIVEN
        const currentTime = jest.fn();
        currentTime.mockReturnValueOnce(5);
        const playerMock = {
            currentTime,
            el: (): object => ({ parentElement: undefined }),
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: RIGHT, shiftKey: true, altKey: true });

        // THEN
        expect(currentTime).toBeCalledWith(6);
    });

    it("shifts playback backwards via keyboard shortcut", () => {
        // GIVEN
        const currentTime = jest.fn();
        currentTime.mockReturnValueOnce(5);
        const playerMock = {
            currentTime,
            el: (): object => ({ parentElement: undefined }),
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url"/>);

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: LEFT, shiftKey: true, altKey: true });

        // THEN
        expect(currentTime).toBeCalledWith(4);
    });

    it("returns currentTime", () => {
        // GIVEN
        const playerMock = {
            currentTime: (): number => 5,
            el: (): object => ({ parentElement: undefined }),
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const actualNode = enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url"/>);
        const component = actualNode.instance() as VideoPlayer;

        // WHEN
        const actualTime = component.getTime();

        // THEN
        expect(actualTime).toEqual(5000);
    });

    it("moves time", () => {
        // GIVEN
        const currentTime = jest.fn();
        currentTime.mockReturnValueOnce(5);
        const playerMock = {
            currentTime,
            el: (): object => ({ parentElement: undefined }),
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const actualNode = enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url"/>);
        const component = actualNode.instance() as VideoPlayer;

        // WHEN
        component.moveTime(5600);

        // THEN
        expect(currentTime).toBeCalledWith(5.6);
    });
});
