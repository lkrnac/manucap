import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
// @ts-ignore - Doesn't have types definitions file
import { CueDto, Track } from "../../model";
import CueEdit from "./CueEdit";
import { Provider } from "react-redux";
import React from "react";
import { createTestingStore } from "../../../testUtils/testingStore";
import { mount } from "enzyme";
import { setValidationError, updateCues, updateSourceCues } from "../cueSlices";
import { AnyAction } from "redux";
import { updateEditingTrack } from "../../trackSlices";
import SubtitleEdit from "../../SubtitleEdit";

let testingStore = createTestingStore();

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
    mediaTitle: "This is the video title",
} as Track;

const cues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

describe("CueEdit", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
    });

    it("auto sets validation error to false after receiving it", (done) => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
        const actualNode = mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cue} playerTime={1} />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(setValidationError(true) as {} as AnyAction);

        // THEN
        setTimeout(() => {
            expect(testingStore.getState().validationError).toEqual(false);
            expect(actualNode.find("div").at(0).hasClass("bg-white")).toBeTruthy();
            done();
        }, 1100);
    });

    it("adds first cue if clicked translation cue and cues are empty", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues([]) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-cue-editor").at(0).simulate("click");

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
        expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
        expect(testingStore.getState().editingCueIndex).toEqual(0);
        expect(testingStore.getState().validationError).toEqual(false);
    });

    it("adds first cue if clicked second translation cue without creating first cue", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues([]) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-cue-editor").at(1).simulate("click");


        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
        expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
        expect(testingStore.getState().editingCueIndex).toEqual(0);
        expect(testingStore.getState().validationError).toEqual(false);
    });
});
