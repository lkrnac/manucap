import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import { mount } from "enzyme";

import { CueDto, Language, Track } from "../model";
import { updateEditingTrack } from "../trackSlices";
import CueLine from "./CueLine";
import { updateCues, updateSourceCues } from "./cueSlices";
import CuesList from "./CuesList";
import AddCueLineButton from "./edit/AddCueLineButton";
import { createTestingStore } from "../../testUtils/testingStore";
import { reset } from "./edit/editorStatesSlice";
import { removeDraftJsDynamicValues, removeVideoPlayerDynamicValue } from "../../testUtils/testUtils";

let testingStore = createTestingStore();

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
    progress: 50
} as Track;

const testingTranslationTrack = {
    type: "TRANSLATION",
    language: { id: "fr-FR", name: "French (France)" } as Language,
    sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
} as Track;

const testingDirectTranslationTrack = {
    type: "TRANSLATION",
    language: { id: "fr-FR", name: "French (France)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
} as Track;


describe("CuesList",() => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(reset() as {} as AnyAction);
    });

    it("renders", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        const expectedNode = mount(
            <Provider store={testingStore} >
                <div style={{ overflowY: "scroll", height: "100%" }} className="sbte-cues-array-container">
                    <CueLine
                        index={0}
                        cue={cues[0]}
                        playerTime={0}
                        onClickHandler={(): void => undefined}
                    />
                    <CueLine
                        index={1}
                        cue={cues[1]}
                        playerTime={0}
                        onClickHandler={(): void => undefined}
                    />
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore} >
                <CuesList editingTrack={testingTrack} currentPlayerTime={0} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(actualNode.html())))
            .toEqual(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(expectedNode.html())));
    });

    it("shows cues when there are same amount of translation and caption cue lines", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
            </Provider>
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        actualNode.update();

        // THEN
        const cueLines = actualNode.find(CueLine);
        expect((cueLines.at(0).props().cue as CueDto).vttCue.text).toEqual("Editing Line 1");
        expect((cueLines.at(0).props().sourceCue as CueDto).vttCue.text).toEqual("Source Line 1");
        expect((cueLines.at(1).props().cue as CueDto).vttCue.text).toEqual("Editing Line 2");
        expect((cueLines.at(1).props().sourceCue as CueDto).vttCue.text).toEqual("Source Line 2");
    });

    it("shows cues in captioning mode", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <CuesList editingTrack={testingTrack} currentPlayerTime={0} />
            </Provider>
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.update();

        // THEN
        expect(actualNode.find(AddCueLineButton).length).toEqual(0);
        const cueLines = actualNode.find(CueLine);
        expect((cueLines.at(0).props().cue as CueDto).vttCue.text).toEqual("Editing Line 1");
        expect(cueLines.at(0).props().sourceCue).toBeUndefined();
        expect((cueLines.at(1).props().cue as CueDto).vttCue.text).toEqual("Editing Line 2");
        expect(cueLines.at(1).props().sourceCue).toBeUndefined();
    });

    it("shows cues when there are more translation cues than caption cues", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
            </Provider>
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        actualNode.update();

        // THEN
        const cueLines = actualNode.find(CueLine);
        expect((cueLines.at(0).props().cue as CueDto).vttCue.text).toEqual("Editing Line 1");
        expect((cueLines.at(0).props().sourceCue as CueDto).vttCue.text).toEqual("Source Line 1");
        expect(cueLines.at(0).props().lastCue).toEqual(false);
        expect((cueLines.at(1).props().cue as CueDto).vttCue.text).toEqual("Editing Line 2");
        expect((cueLines.at(1).props().sourceCue as CueDto).vttCue.text).toEqual("Source Line 2");
        expect(cueLines.at(1).props().lastCue).toEqual(true);
        expect(cueLines.at(2).props().cue).toBeUndefined();
        expect((cueLines.at(2).props().sourceCue as CueDto).vttCue.text).toEqual("Source Line 3");
    });

    it("shows cues when there are more caption cues than translation cues", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Editing Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        actualNode.update();

        // THEN
        const cueLines = actualNode.find(CueLine);
        expect((cueLines.at(0).props().cue as CueDto).vttCue.text).toEqual("Editing Line 1");
        expect((cueLines.at(0).props().sourceCue as CueDto).vttCue.text).toEqual("Source Line 1");
        expect((cueLines.at(1).props().cue as CueDto).vttCue.text).toEqual("Editing Line 2");
        expect((cueLines.at(1).props().sourceCue as CueDto).vttCue.text).toEqual("Source Line 2");
        expect(cueLines.at(2)).toEqual({});
    });

    it("shows cues as caption cues for direct translation track", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Editing Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <CuesList editingTrack={testingDirectTranslationTrack} currentPlayerTime={0} />
            </Provider>
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.update();

        // THEN
        expect(actualNode.find(AddCueLineButton).length).toEqual(0);
        const cueLines = actualNode.find(CueLine);
        // console.log(actualNode.)
        expect((cueLines.at(0).props().cue as CueDto).vttCue.text).toEqual("Editing Line 1");
        expect(cueLines.at(0).props().sourceCue as CueDto).toBeUndefined();
        expect((cueLines.at(1).props().cue as CueDto).vttCue.text).toEqual("Editing Line 2");
        expect(cueLines.at(1).props().sourceCue as CueDto).toBeUndefined();
        expect((cueLines.at(2).props().cue as CueDto).vttCue.text).toEqual("Editing Line 3");
        expect(cueLines.at(2).props().sourceCue as CueDto).toBeUndefined();
    });

    it("shows starts captioning button for empty direct translation track", () => {
        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <CuesList editingTrack={testingDirectTranslationTrack} currentPlayerTime={0} />
            </Provider>
        );
        testingStore.dispatch(updateCues([]) as {} as AnyAction);
        actualNode.update();

        // THEN
        expect(actualNode.find(AddCueLineButton).length).toEqual(1);
        expect(actualNode.find(CueLine).length).toEqual(0);
    });

    it("does not show starts captioning button for translation track empty source cues", () => {
        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues([]) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues([]) as {} as AnyAction);
        actualNode.update();

        // THEN
        expect(actualNode.find(AddCueLineButton).length).toEqual(0);
        expect(actualNode.find(CueLine).length).toEqual(0);
    });

    it("opens cue for editing", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
            </Provider>
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        actualNode.update();
        actualNode.find(CueLine).at(1).simulate("click");

        // THEN
        expect(testingStore.getState().editingCueIndex).toEqual(1);
    });

    it("adds new cue if empty cue is clicked in translation mode", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
            </Provider>
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        actualNode.update();
        actualNode.find(CueLine).at(2).simulate("click");

        // THEN
        expect(testingStore.getState().cues.length).toEqual(3);
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("");
        expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(2);
        expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(3);
    });
});