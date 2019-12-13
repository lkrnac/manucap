import "../initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import videojs from "video.js";
import VideoPlayer from "./VideoPlayer";
import {Track, TrackVersion} from "./model";
import {simulateComponentDidUpdate} from "../testUtils";

jest.mock("video.js");
const O_CHAR = 79;
const LEFT = 37;
const RIGHT = 39;

interface FakeTextTrack {
    cues: VTTCue[];
}

interface FakeTextTrackList {
    addEventListener(type: string, listener: (this: TextTrackList, event: TrackEvent) => void): void;
}

export const initialTestingTracks = [
    {
        type: "CAPTION",
        language: { id: "en-US" },
        default: true,
        currentVersion: { cues: [
                new VTTCue(0, 1, "Caption Line 1"),
                new VTTCue(1, 2, "Caption Line 2"),
            ]} as TrackVersion
    } as Track,
    {
        type: "TRANSLATION",
        language: { id: "es-ES" },
        default: false,
        currentVersion: { cues: [
                new VTTCue(0, 1, "Translation Line 1"),
                new VTTCue(1, 2, "Translation Line 2"),
            ]} as TrackVersion
    } as Track
];

describe("VideoPlayer", () => {
    it("executes play via keyboard shortcut", () => {
        // GIVEN
        const play = jest.fn();
        const playerMock = {
            paused: (): boolean => true,
            play,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() })
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]}/>);

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
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() })
        };
        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]}/>);

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
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() })
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]}/>);

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
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() })
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]}/>);

        // WHEN
        simulant.fire(document.documentElement, "keydown", { keyCode: LEFT, shiftKey: true, altKey: true });

        // THEN
        expect(currentTime).toBeCalledWith(4);
    });

    it("returns currentTime", () => {
        // GIVEN
        const playerMock = {
            currentTime: (): number => 5,
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() })
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const actualNode = enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]}/>);
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
            textTracks: (): FakeTextTrackList => ({ addEventListener: jest.fn() })
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const actualNode = enzyme.mount(<VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={[]}/>);
        const component = actualNode.instance() as VideoPlayer;

        // WHEN
        component.moveTime(5600);

        // THEN
        expect(currentTime).toBeCalledWith(5.6);
    });

    it("update tracks content", () => {
        // GIVEN
        const captionCues = initialTestingTracks[0].currentVersion ? initialTestingTracks[0].currentVersion.cues : [];
        const translationCues = initialTestingTracks[1].currentVersion
            ? initialTestingTracks[1].currentVersion.cues
            : [];
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
        const tracks =  [
            {
                type: "CAPTION",
                language: { id: "en-US" },
                default: true,
                currentVersion: { cues: [new VTTCue(0, 1, "Updated Caption")]}
            },
            {
                type: "TRANSLATION",
                language: { id: "es-ES" },
                default: false,
                currentVersion: { cues: [new VTTCue(0, 1, "Updated Translation")]}
            }
        ];

        const playerMock = {
            textTracks: (): FakeTextTrack[] => textTracks
        };

        // @ts-ignore - we are mocking the module
        videojs.mockImplementationOnce(() => playerMock);
        const actualNode = enzyme.mount(
            <VideoPlayer poster="dummyPosterUrl" mp4="dummyMp4Url" tracks={initialTestingTracks}/>
        );

        // WHEN
        simulateComponentDidUpdate(actualNode, { tracks });

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
});
