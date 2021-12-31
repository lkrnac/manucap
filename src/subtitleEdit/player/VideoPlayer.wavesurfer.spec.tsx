import "../../testUtils/initBrowserEnvironment";
import { CueDto, Track } from "../model";
import VideoPlayer from "./VideoPlayer";
import { mount } from "enzyme";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import { act } from "react-dom/test-utils";
import React from "react";

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
        expect(actualComponent.wavesurfer.params.height).toEqual(200);
        expect(actualComponent.wavesurfer.params.pixelRatio).toEqual(1);
        expect(actualComponent.wavesurfer.params.barHeight).toEqual(0.4);
        expect(actualComponent.wavesurfer.params.plugins.length).toEqual(3);
        expect(actualComponent.wavesurfer.params.plugins[0].name).toEqual("regions");
        expect(actualComponent.wavesurfer.params.plugins[1].name).toEqual("minimap");
        expect(actualComponent.wavesurfer.params.plugins[2].name).toEqual("timeline");
        expect(actualComponent.wavesurfer.initialisedPluginList).toEqual(
            { regions: true, minimap: true, timeline: true });
        expect(actualComponent.wavesurfer.regions.params).toEqual({ dragSelection: false });
        expect(actualComponent.wavesurfer.minimap.params.height).toEqual(50);
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
            React.createElement(
                props => (
                    <Provider store={testingStore}>
                        <VideoPlayer {...props} />
                    </Provider>
                ),
                properties)
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
    });
});
