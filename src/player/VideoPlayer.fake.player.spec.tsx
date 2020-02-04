import "../testUtils/initBrowserEnvironment";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import { LanguageCues, Track } from "./model";
import React from "react";
import VideoPlayer from "./VideoPlayer";
import { copyNonConstructorProperties } from "../subtitleEdit/cueUtils";
import { mount } from "enzyme";
import { simulateComponentDidUpdate } from "../testUtils/testUtils";
import videojs from "video.js";

jest.mock("video.js");
jest.mock("../subtitleEdit/cueUtils");

const O_CHAR = 79;
const LEFT = 37;
const RIGHT = 39;

interface FakeTextTrack {
    cues: VTTCue[];
}

interface FakeTextTrackList {
    addEventListener(type: string, listener: (this: TextTrackList, event: TrackEvent) => void): void;
}

const initialTestingTracks = [
    { type: "CAPTION", language: { id: "en-US" }, default: true },
    { type: "TRANSLATION", language: { id: "es-ES" }, default: false }
] as Track[];

const initialTestingLanguageCuesArray = [
    {
        languageId: "en-US",
        cues: [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ]
    },
    {
        languageId: "es-ES",
        cues: [
            { vttCue: new VTTCue(0, 1, "Translation Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Translation Line 2"), cueCategory: "DIALOGUE" },
        ]
    },
] as LanguageCues[];

describe("VideoPlayer tested with fake player", () => {
    it("executes play via keyboard shortcut", () => {
        // GIVEN
        const play = jest.fn();
        const playerMock = {
            paused: (): boolean => true,
            play,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]} languageCuesArray={[]} />);

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: O_CHAR, shiftKey: true, altKey: true });

        // THEN
        expect(play).toBeCalled();
    });

    it("executes pause via keyboard shortcut", () => {
        // GIVEN
        const pause = jest.fn();
        const playerMock = {
            pause,
            paused: (): boolean => false,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]} languageCuesArray={[]} />);

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
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]} languageCuesArray={[]} />);

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
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]} languageCuesArray={[]} />);

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: LEFT, shiftKey: true, altKey: true });

        // THEN
        expect(currentTime).toBeCalledWith(4);
    });

    it("returns currentTime", () => {
        // GIVEN
        const playerMock = {
            currentTime: (): number => 5,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const actualNode = mount(
            <VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]} languageCuesArray={[]} />
        );
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
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() }),
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const actualNode = mount(
            <VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]} languageCuesArray={[]} />
        );
        const component = actualNode.instance() as VideoPlayer;

        // WHEN
        component.moveTime(5600);

        // THEN
        expect(currentTime).toBeCalledWith(5.6);
    });

    it("update tracks content", () => {
        // GIVEN
        const captionCues = [new VTTCue(0, 1, "Caption Line 1"), new VTTCue(1, 2, "Caption Line 2")];
        const translationCues = [new VTTCue(0, 1, "Translation Line 1"), new VTTCue(1, 2, "Translation Line 2")];
        const textTracks = [
            {
                language: "en-US",
                addCue: jest.fn(),
                removeCue: jest.fn(),
                length: 2,
                cues: captionCues,
                dispatchEvent: jest.fn()
            },
            {
                language: "es-ES",
                addCue: jest.fn(),
                removeCue: jest.fn(),
                length: 2,
                cues: translationCues,
                dispatchEvent: jest.fn()
            }
        ];
        textTracks["addEventListener"] = jest.fn();
        const languageCuesArray = [
            {
                languageId: "en-US",
                cues: [{ vttCue: new VTTCue(0, 1, "Updated Caption"), cueCategory: "DIALOGUE" }]},
            {
                languageId: "es-ES",
                cues: [{ vttCue: new VTTCue(0, 1, "Updated Translation"), cueCategory: "DIALOGUE" }]
            },
        ];

        const playerMock = {
            textTracks: (): FakeTextTrack[] => textTracks,
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={initialTestingTracks}
                languageCuesArray={initialTestingLanguageCuesArray}
            />
        );

        // WHEN
        simulateComponentDidUpdate(actualNode, { languageCuesArray });

        // THEN
        expect(textTracks[0].removeCue).nthCalledWith(1, new VTTCue(1, 2, "Caption Line 2"));
        expect(textTracks[0].removeCue).nthCalledWith(2, new VTTCue(0, 1, "Caption Line 1"));
        expect(textTracks[0].addCue).toBeCalledWith(new VTTCue(0, 1, "Updated Caption"));
        expect(textTracks[0].dispatchEvent).toBeCalledWith(new Event("cuechange"));
        expect(textTracks[1].removeCue).nthCalledWith(1, new VTTCue(1, 2, "Translation Line 2"));
        expect(textTracks[1].removeCue).nthCalledWith(2, new VTTCue(0, 1, "Translation Line 1"));
        expect(textTracks[1].addCue).toBeCalledWith(new VTTCue(0, 1, "Updated Translation"));
        expect(textTracks[1].dispatchEvent).toBeCalledWith(new Event("cuechange"));
    });

    it("maintains cue styles when cue is updated", () => {
        // GIVEN
        // @ts-ignore We are mocking function with jest
        copyNonConstructorProperties.mockImplementationOnce(() => jest.fn());
        const textTracks = [
            {
                language: "en-US",
                addCue: jest.fn(),
                removeCue: jest.fn(),
                length: 1,
                cues: [new VTTCue(0, 1, "Caption Line 1")],
                dispatchEvent: jest.fn()
            }
        ];
        textTracks["addEventListener"] = jest.fn();
        const updatedVttCue = new VTTCue(0, 1, "Updated Caption");
        updatedVttCue.position = 60;
        updatedVttCue.align = "start";
        const updatedCue = { vttCue: updatedVttCue, cueCategory: "DIALOGUE" };
        const languageCuesArray = [{ languageId: "en-US", cues: [updatedCue]}];

        const playerMock = {
            textTracks: (): FakeTextTrack[] => textTracks,
            on: jest.fn()
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const actualNode = mount(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                tracks={initialTestingTracks}
                languageCuesArray={initialTestingLanguageCuesArray}
            />
        );

        // WHEN
        simulateComponentDidUpdate(actualNode, { languageCuesArray });

        // THEN
        expect(copyNonConstructorProperties).toBeCalledWith(new VTTCue(0, 1, "Caption Line 1"), updatedVttCue);
    });
});
