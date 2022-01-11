import "../../testUtils/initBrowserEnvironment";
import { CueDto, Track } from "../model";
import VideoPlayer from "./VideoPlayer";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import React from "react";
import { Provider } from "react-redux";
import { createTestingStore } from "../../testUtils/testingStore";

let testingStore = createTestingStore();

const cues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
] as CueDto[];

const tracks = [
    { type: "CAPTION", language: { id: "en-US" }, default: true } as Track,
    { type: "TRANSLATION", language: { id: "es-ES" }, default: false } as Track
];

// @ts-ignore we are just mocking
jest.spyOn(global, "fetch").mockResolvedValue({
    json: jest.fn().mockResolvedValue({
        data: [0,-1,0,-1,4,-6,4,-3,4,-1,3,-3,3,-5,4,-1,6,-8,1,0,5,-3,0,-2,1,0,4]
    })
});

describe("VideoPlayer with waveform", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
    it("initializes wavesurfer with correct options", async () => {
        // GIVEN
        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    waveform="dummyWaveform"
                    duration={20}
                    tracks={tracks}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.params.normalize).toBeTruthy();
        expect(actualComponent.wavesurfer.params.scrollParent).toBeTruthy();
        expect(actualComponent.wavesurfer.params.minimap).toBeTruthy();
        expect(actualComponent.wavesurfer.params.backend).toEqual("MediaElement");
        expect(actualComponent.wavesurfer.params.height).toEqual(100);
        expect(actualComponent.wavesurfer.params.pixelRatio).toEqual(1);
        expect(actualComponent.wavesurfer.params.barHeight).toEqual(0.4);
        expect(actualComponent.wavesurfer.params.plugins.length).toEqual(3);
        expect(actualComponent.wavesurfer.params.plugins[0].name).toEqual("regions");
        expect(actualComponent.wavesurfer.params.plugins[1].name).toEqual("minimap");
        expect(actualComponent.wavesurfer.params.plugins[2].name).toEqual("timeline");
        expect(actualComponent.wavesurfer.initialisedPluginList).toEqual(
            { regions: true, minimap: true, timeline: true });
        expect(actualComponent.wavesurfer.regions.params).toEqual({ dragSelection: false });
        expect(actualComponent.wavesurfer.minimap.params.height).toEqual(30);
    });

    it("initializes wavesurfer with regions", async () => {
        // GIVEN
        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    waveform="dummyWaveform"
                    duration={20}
                    cues={cues}
                    tracks={tracks}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
        expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 1");
        expect(actualComponent.wavesurfer.regions.list[1].start).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[1].end).toEqual(4);
        expect(actualComponent.wavesurfer.regions.list[1].attributes.label).toEqual("Caption Line 2");
    });

    it("initializes wavesurfer with regions and ignores cues out of video time", async () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(21, 23, "Caption Line 3"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    waveform="dummyWaveform"
                    duration={20}
                    cues={cues}
                    tracks={tracks}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[2]).toBeUndefined();
    });

    it("creates wavesurfer region when cue is added", async () => {
        // GIVEN
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            duration: 20,
            cues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (
                <Provider store={testingStore}><VideoPlayer {...props} /></Provider>), properties)
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        actualNode.setProps(
            // @ts-ignore I only need to update these props
            { lastCueChange: { changeType: "ADD", index: 2, vttCue: new VTTCue(4, 6, "Added Caption") }}
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[2].attributes.label).toEqual("Added Caption");
        expect(actualComponent.wavesurfer.regions.list[2].start).toEqual(4);
        expect(actualComponent.wavesurfer.regions.list[2].end).toEqual(6);
    });

    it("updates wavesurfer region when cue is edited", async () => {
        // GIVEN
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            duration: 20,
            cues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (
                <Provider store={testingStore}><VideoPlayer {...props} /></Provider>), properties)
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        actualNode.setProps(
            // @ts-ignore I only need to update these props
            { lastCueChange: { changeType: "EDIT", index: 0, vttCue: new VTTCue(0, 1, "Updated Caption") }}
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Updated Caption");
        expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
        expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(1);
    });

    it("removes wavesurfer region when cue is deleted", async () => {
        // GIVEN
        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            duration: 20,
            cues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (
                <Provider store={testingStore}><VideoPlayer {...props} /></Provider>), properties)
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        actualNode.setProps(
            // @ts-ignore I only need to update these props
            { lastCueChange: { changeType: "REMOVE", index: 0, vttCue: new VTTCue(0, 0, "") }}
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0]).toBeUndefined();
    });

    it("updates wavesurfer region when cue is split", async () => {
        // GIVEN
        const splitCues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(1, 2, ""), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];

        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            duration: 20,
            cues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (
                <Provider store={testingStore}><VideoPlayer {...props} /></Provider>), properties)
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        actualNode.setProps(
            // @ts-ignore I only need to update these props
            { lastCueChange: { changeType: "SPLIT", index: 0, vttCue: new VTTCue(0, 2, "Caption Line 1") },
                cues: splitCues }
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 1");
        expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
        expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(1);
        expect(actualComponent.wavesurfer.regions.list[1].attributes.label).toEqual("");
        expect(actualComponent.wavesurfer.regions.list[1].start).toEqual(1);
        expect(actualComponent.wavesurfer.regions.list[1].end).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[2].attributes.label).toEqual("Caption Line 2");
        expect(actualComponent.wavesurfer.regions.list[2].start).toEqual(2);
        expect(actualComponent.wavesurfer.regions.list[2].end).toEqual(4);
    });

    it("updates wavesurfer region when cues are merged", async () => {
        // GIVEN
        const mergedCues = [
            { vttCue: new VTTCue(0, 4, "Caption Line 1 Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];

        const properties = {
            poster: "dummyPosterUrl",
            mp4: "dummyMp4Url",
            waveform: "dummyWaveform",
            duration: 20,
            cues,
            tracks,
            languageCuesArray: [],
            lastCueChange: null
        };
        const actualNode = mount(
            React.createElement(props => (
                <Provider store={testingStore}><VideoPlayer {...props} /></Provider>), properties)
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        actualNode.setProps(
            // @ts-ignore I only need to update these props
            { lastCueChange: { changeType: "MERGE", index: 0, vttCue: new VTTCue(0, 2, "Caption Line 1") },
                cues: mergedCues }
        );

        // THEN
        const videoNode = actualNode.find("VideoPlayer");
        // @ts-ignore can't find the correct syntax
        const actualComponent = videoNode.instance() as VideoPlayer;

        expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 1 Caption Line 2");
        expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
        expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(4);
        expect(actualComponent.wavesurfer.regions.list[1]).toBeUndefined();
    });

    it("hides waveform accordion if no waveform is present", async () => {
        // GIVEN
        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <VideoPlayer
                    poster="dummyPosterUrl"
                    mp4="dummyMp4Url"
                    waveform=""
                    duration={20}
                    tracks={tracks}
                    languageCuesArray={[]}
                    lastCueChange={null}
                />
            </Provider>
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // THEN
        const accordionNode = actualNode.find("Accordion");

        expect(accordionNode.get(0)).toBeUndefined();
    });
});
