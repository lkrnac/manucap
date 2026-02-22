import "../../testUtils/initBrowserEnvironment";
import { act, createRef } from "react";
import { render, waitFor } from "@testing-library/react";

import { CueDto, LanguageCues, Track } from "../model";
import VideoPlayer from "./VideoPlayer";

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
    it("initializes wavesurfer with correct options", async () => {
        // GIVEN
        const videoPlayerRef = createRef<VideoPlayer>();

        // WHEN
        render(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                waveformVisible
                mediaLength={20000}
                timecodesUnlocked
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

        // THEN
        const actualComponent = videoPlayerRef.current as VideoPlayer;
        await waitFor(async () => {
            expect(actualComponent.wavesurfer.params.normalize).toBeFalsy();
            expect(actualComponent.wavesurfer.params.scrollParent).toBeTruthy();
            expect(actualComponent.wavesurfer.params.minimap).toBeTruthy();
            expect(actualComponent.wavesurfer.params.partialRender).toBeTruthy();
            expect(actualComponent.wavesurfer.params.cursorColor).toEqual("#007bff");
            expect(actualComponent.wavesurfer.params.cursorWidth).toBeTruthy();
            expect(actualComponent.wavesurfer.params.backend).toEqual("MediaElement");
            expect(actualComponent.wavesurfer.params.removeMediaElementOnDestroy).toBeFalsy();
            expect(actualComponent.wavesurfer.params.height).toEqual(100);
            expect(actualComponent.wavesurfer.params.pixelRatio).toEqual(1);
            expect(actualComponent.wavesurfer.params.barHeight).toEqual(0.01);
            expect(actualComponent.wavesurfer.params.plugins.length).toEqual(2);
            expect(actualComponent.wavesurfer.params.plugins[0].name).toEqual("regions");
            expect(actualComponent.wavesurfer.params.plugins[1].name).toEqual("timeline");
            expect(actualComponent.wavesurfer.initialisedPluginList).toEqual({regions: true, timeline: true});
            expect(actualComponent.wavesurfer.regions.params).toEqual({dragSelection: false});
            expect(actualComponent.wavesurfer.regions.list[0].drag).toBeFalsy();
            expect(actualComponent.wavesurfer.regions.list[0].loop).toBeFalsy();
            expect(actualComponent.wavesurfer.regions.list[0].resize).toBeTruthy();
            expect(actualComponent.wavesurfer.regions.list[0].formatTimeCallback(0, 2)).toEqual("00:00:000-00:02:000");
            expect(actualComponent.wavesurfer.getCurrentTime()).toEqual(0);
        });
    });

    it("initializes wavesurfer with regions", async () => {
        // GIVEN
        const videoPlayerRef = createRef<VideoPlayer>();

        // WHEN
        render(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                waveformVisible
                mediaLength={20000}
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

        // THEN
        const actualComponent = videoPlayerRef.current as VideoPlayer;
        await waitFor(async () => {
            expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
            expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(2);
            expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 1");
            expect(actualComponent.wavesurfer.regions.list[1].start).toEqual(2);
            expect(actualComponent.wavesurfer.regions.list[1].end).toEqual(4);
            expect(actualComponent.wavesurfer.regions.list[1].attributes.label).toEqual("Caption Line 2");
        });
    });

    it("initializes wavesurfer with regions and ignores cues out of video time", async () => {
        // GIVEN
        const videoPlayerRef = createRef<VideoPlayer>();
        const cues = [
            { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(21, 23, "Caption Line 3"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];

        // WHEN
        render(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                waveformVisible
                mediaLength={20000}
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

        // THEN
        const actualComponent = videoPlayerRef.current as VideoPlayer;
        await waitFor(async () => {
            expect(actualComponent.wavesurfer.regions.list[2]).toBeUndefined();
        });
    });

    it("creates wavesurfer region when cue is added at the end", async () => {
        // GIVEN
        const videoPlayerRef = createRef<VideoPlayer>();

        const actualNode = render(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 50)));

        // WHEN
        actualNode.rerender(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={{ changeType: "ADD", index: 2, vttCue: new VTTCue(4, 6, "Added Caption") }}
            />
        );

        // THEN
        const actualComponent = videoPlayerRef.current as VideoPlayer;
        await waitFor(async () => {
            expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 1");
            expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
            expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(2);
            expect(actualComponent.wavesurfer.regions.list[1].attributes.label).toEqual("Caption Line 2");
            expect(actualComponent.wavesurfer.regions.list[1].start).toEqual(2);
            expect(actualComponent.wavesurfer.regions.list[1].end).toEqual(4);
            expect(actualComponent.wavesurfer.regions.list[2].attributes.label).toEqual("Added Caption");
            expect(actualComponent.wavesurfer.regions.list[2].start).toEqual(4);
            expect(actualComponent.wavesurfer.regions.list[2].end).toEqual(6);
            expect(actualComponent.wavesurfer.regions.list[2].reset).toBeFalsy();
        });
    });

    it("creates wavesurfer region when cue is added in the middle", async () => {
        // GIVEN
        const videoPlayerRef = createRef<VideoPlayer>();
        const testCues = [
            { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(4, 6, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];
        const updatedCues = [
            { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(2, 4, "Added Caption"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(4, 6, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];

        const actualNode = render(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={testCues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

        // WHEN
        actualNode.rerender(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={updatedCues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={
                    { changeType: "ADD", index: 1, vttCue: new VTTCue(2, 4, "Added Caption") }
                }
            />
        );

        // THEN
        const actualComponent = videoPlayerRef.current as VideoPlayer;
        await waitFor(async () => {
            expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 1");
            expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
            expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(2);
            expect(actualComponent.wavesurfer.regions.list[1].attributes.label).toEqual("Added Caption");
            expect(actualComponent.wavesurfer.regions.list[1].start).toEqual(2);
            expect(actualComponent.wavesurfer.regions.list[1].end).toEqual(4);
            expect(actualComponent.wavesurfer.regions.list[2].attributes.label).toEqual("Caption Line 2");
            expect(actualComponent.wavesurfer.regions.list[2].start).toEqual(4);
            expect(actualComponent.wavesurfer.regions.list[2].end).toEqual(6);
            expect(actualComponent.wavesurfer.regions.list[2].reset).toBeFalsy();
        });
    });

    it("updates wavesurfer region when cue is edited", async () => {
        // GIVEN
        const videoPlayerRef = createRef<VideoPlayer>();
        const actualNode = render(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 50)));

        // WHEN
        actualNode.rerender(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={{ changeType: "EDIT", index: 0, vttCue: new VTTCue(0, 1.123, "Updated Caption") }}
            />
        );


        // THEN
        const actualComponent = videoPlayerRef.current as VideoPlayer;
        expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Updated Caption");
        expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
        expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(1.123);
        expect(actualComponent.wavesurfer.regions.list[0].reset).toBeFalsy();
        expect(actualComponent.wavesurfer.regions.list[0].formatTimeCallback(0, 1.123)).toEqual("00:00:000-00:01:123");
    });

    it("removes wavesurfer region when cue is deleted", async () => {
        // GIVEN
        const videoPlayerRef = createRef<VideoPlayer>();
        const updatedCues = [
            { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];

        const actualNode = render(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

        // WHEN
        actualNode.rerender(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={updatedCues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={{ changeType: "REMOVE", index: 0, vttCue: new VTTCue(0, 0, "") }}
            />
        );

        // THEN
        const actualComponent = videoPlayerRef.current as VideoPlayer;
        await waitFor(async () => {
            expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 2");
            expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(2);
            expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(4);
            expect(actualComponent.wavesurfer.regions.list[1]).toBeUndefined();
        });
    });

    it("updates wavesurfer region when cue is split", async () => {
        // GIVEN
        const videoPlayerRef = createRef<VideoPlayer>();
        const splitCues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(1, 2, ""), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];

        const actualNode = render(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        // await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        actualNode.rerender(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={splitCues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={{ changeType: "SPLIT", index: 0, vttCue: new VTTCue(0, 2, "Caption Line 1") }}
            />
        );

        // THEN
        const actualComponent = videoPlayerRef.current as VideoPlayer;
        await waitFor(async () => {
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
    });

    it("updates wavesurfer region when cues are merged", async () => {
        // GIVEN
        const mergedCues = [
            { vttCue: new VTTCue(0, 4, "Caption Line 1 Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
        ] as CueDto[];

        const videoPlayerRef = createRef<VideoPlayer>();
        const { rerender } = render(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 50)));

        // WHEN
        rerender(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={mergedCues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={{ changeType: "MERGE", index: 0, vttCue: new VTTCue(0, 2, "Caption Line 1") }}
            />
        );

        // THEN
        const actualComponent = videoPlayerRef.current as VideoPlayer;
        await waitFor(async () => {
            expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("Caption Line 1 Caption Line 2");
            expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
            expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(4);
            expect(actualComponent.wavesurfer.regions.list[1]).toBeUndefined();
        });
    });

    it("updates wavesurfer regions when cues are updated", async () => {
        // GIVEN
        const videoPlayerRef = createRef<VideoPlayer>();
        const { rerender } = render(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 50)));
        const newCaptionCues = [
            { vttCue: new VTTCue(0, 1, "New Caption Line A"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(1, 2, "New Caption Line B"), cueCategory: "DIALOGUE", errors: []},
            { vttCue: new VTTCue(2, 3, "New Caption Line C"), cueCategory: "DIALOGUE", errors: []}
        ] as CueDto[];

        // WHEN
        rerender(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={newCaptionCues}
                tracks={tracks}
                languageCuesArray={[{ languageId: "en-US", cues: newCaptionCues }] as LanguageCues[]}
                lastCueChange={{ changeType: "UPDATE_ALL", index: -1 }}
            />
        );

        // THEN
        const actualComponent = videoPlayerRef.current as VideoPlayer;
        await waitFor(async () => {
            expect(actualComponent.wavesurfer.regions.list[0].attributes.label).toEqual("New Caption Line A");
            expect(actualComponent.wavesurfer.regions.list[0].start).toEqual(0);
            expect(actualComponent.wavesurfer.regions.list[0].end).toEqual(1);
            expect(actualComponent.wavesurfer.regions.list[1].attributes.label).toEqual("New Caption Line B");
            expect(actualComponent.wavesurfer.regions.list[1].start).toEqual(1);
            expect(actualComponent.wavesurfer.regions.list[1].end).toEqual(2);
            expect(actualComponent.wavesurfer.regions.list[2].attributes.label).toEqual("New Caption Line C");
            expect(actualComponent.wavesurfer.regions.list[2].start).toEqual(2);
            expect(actualComponent.wavesurfer.regions.list[2].end).toEqual(3);
            expect(actualComponent.wavesurfer.regions.list[3]).toBeUndefined();
        });
    });

    it("hides waveform if no waveform url is present", async () => {
        // GIVEN
        // WHEN
        const { container } = render(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform=""
                waveformVisible
                mediaLength={20000}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 50)));

        // THEN
        const waveformNode = container.querySelector(".mc-waveform");

        expect(waveformNode).toBeNull();
    });

    it("hides waveform if mediaLength parameter is missing", async () => {
        // GIVEN
        // WHEN
        const { container } = render(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dymmyWaveform"
                waveformVisible
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 50)));

        // THEN
        const waveformNode = container.querySelector(".mc-waveform");

        expect(waveformNode).toBeNull();
    });

    it("hides waveform if waveform visible flag is false", async () => {
        // GIVEN
        // WHEN
        const { container } = render(
            <VideoPlayer
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                waveformVisible={false}
                mediaLength={20000}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 50)));

        // THEN
        const waveformNode = container.querySelector(".mc-waveform");

        expect(waveformNode).not.toBeUndefined();
    });

    it("doesn't update regions when cue is added if waveform is hidden", async () => {
        // GIVEN
        const videoPlayerRef = createRef<VideoPlayer>();
        const { rerender } = render(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 50)));

        // WHEN
        rerender(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible={false}
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={{ changeType: "ADD", index: 2, vttCue: new VTTCue(4, 6, "Added Caption") }}
            />
        );

        // THEN
        const actualComponent = videoPlayerRef.current as VideoPlayer;
        expect(actualComponent.wavesurfer).toBeUndefined();
    });

    it("updates regions when cue is added if waveform is enabled after being hidden", async () => {
        // GIVEN
        const videoPlayerRef = createRef<VideoPlayer>();
        const { rerender } = render(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible={false}
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

        // WHEN
        rerender(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible={true}
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 50)));
        rerender(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible={true}
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={{ changeType: "ADD", index: 2, vttCue: new VTTCue(4, 6, "Added Caption") }}
            />
        );

        // THEN
        const actualComponent = videoPlayerRef.current as VideoPlayer;
        await waitFor(async () => {
            expect(actualComponent.wavesurfer).toBeDefined();
            expect(actualComponent.wavesurfer.regions.list[2].attributes.label).toEqual("Added Caption");
            expect(actualComponent.wavesurfer.regions.list[2].start).toEqual(4);
            expect(actualComponent.wavesurfer.regions.list[2].end).toEqual(6);
        });
    });

    it("updates cue timecodes when modifying waveform region", async () => {
        // GIVEN
        const updateCueTimecodes = jest.fn();
        const videoPlayerRef = createRef<VideoPlayer>();
        const { rerender } = render(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible={false}
                updateCueTimecodes={updateCueTimecodes}
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

        // WHEN
        rerender(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible={true}
                updateCueTimecodes={updateCueTimecodes}
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 50)));
        const actualComponent = videoPlayerRef.current as VideoPlayer;

        // THEN
        const regionUpdate = { id: 0, start: 0, end: 2.4567 };
        actualComponent.wavesurfer.fireEvent("region-update-end", regionUpdate);

        expect(updateCueTimecodes).toHaveBeenCalledWith(0, 0, 2.4567);
    });

    it("updates wavesurfer regions when timecodes are unlocked", async () => {
        // GIVEN
        const videoPlayerRef = createRef<VideoPlayer>();
        const { rerender } = render(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible={true}
                timecodesUnlocked={false}
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 50)));

        // WHEN
        rerender(
            <VideoPlayer
                ref={videoPlayerRef}
                poster="dummyPosterUrl"
                mp4="dummyMp4Url"
                waveform="dummyWaveform"
                mediaLength={20000}
                waveformVisible={true}
                timecodesUnlocked={true}
                cues={cues}
                tracks={tracks}
                languageCuesArray={[]}
                lastCueChange={null}
            />
        );

        // THEN
        const actualComponent = videoPlayerRef.current as VideoPlayer;
        await waitFor(async () => {
            expect(actualComponent.wavesurfer.regions.list[0].resize).toBeTruthy();
            expect(actualComponent.wavesurfer.regions.list[1].resize).toBeTruthy();
        });
    });
});
