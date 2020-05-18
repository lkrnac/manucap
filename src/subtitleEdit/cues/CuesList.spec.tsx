import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import { mount, ReactWrapper } from "enzyme";

import { CueDto, CueWithSource, Language, ScrollPosition, Track } from "../model";
import { updateEditingTrack } from "../trackSlices";
import CueLine, { CueLineRowProps } from "./CueLine";
import { updateCues, updateSourceCues } from "./cueSlices";
import CuesList from "./CuesList";
import AddCueLineButton from "./edit/AddCueLineButton";
import { createTestingStore } from "../../testUtils/testingStore";
import { reset } from "./edit/editorStatesSlice";
import { removeDraftJsDynamicValues, removeVideoPlayerDynamicValue } from "../../testUtils/testUtils";
import { act } from "react-dom/test-utils";
import { changeScrollPosition } from "./cuesListScrollSlice";

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

const simulateEnoughSpaceForCues = (actualNode: ReactWrapper): void => act(() => {
    // Simulate enough space in viewport
    // @ts-ignore
    actualNode.find(".sbte-smart-scroll").at(1).getDOMNode().getBoundingClientRect =
        jest.fn(() => ({ bottom: 500, height: 500, left: 0, right: 500, top: 0, width: 500 }));
    window.dispatchEvent(new Event("resize")); // trigger smart scroll space re-calculation
});

describe("CuesList", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(reset() as {} as AnyAction);
    });

    it("renders renders only one cue when there isn't enough space in viewport", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                    <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                        <CueLine
                            rowIndex={0}
                            data={{ cue: cues[0] }}
                            rowProps={{ playerTime: 0 } as CueLineRowProps}
                            rowRef={React.createRef()}
                            onClick={(): void => undefined}
                        />
                    </div >
                </div >
            </Provider >
        );

        // WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTrack} currentPlayerTime={0} />
            </Provider >
        );

        // THEN
        expect(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(actualNode.html())))
            .toEqual(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(expectedNode.html())));
    });


    it("renders all cues when there is enough space in viewport", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                    <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                        <CueLine
                            rowIndex={0}
                            data={{ cue: cues[0] }}
                            rowProps={{ playerTime: 0 } as CueLineRowProps}
                            rowRef={React.createRef()}
                            onClick={(): void => undefined}
                        />
                        <CueLine
                            rowIndex={1}
                            data={{ cue: cues[1] }}
                            rowProps={{ playerTime: 0 } as CueLineRowProps}
                            rowRef={React.createRef()}
                            onClick={(): void => undefined}
                        />
                    </div >
                </div >
            </Provider >
        );

        // WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTrack} currentPlayerTime={0} />
            </Provider >
        );
        simulateEnoughSpaceForCues(actualNode);
        actualNode.setProps({}); // re-render component

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
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
            </Provider >
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        actualNode.setProps({}); // re-render component

        // THEN
        const cuesWithSource = actualNode.find("ReactSmartScroll").props().data as {} as CueWithSource[];
        expect((cuesWithSource[0].cue as CueDto).vttCue.text).toEqual("Editing Line 1");
        expect((cuesWithSource[0].sourceCue as CueDto).vttCue.text).toEqual("Source Line 1");
        expect((cuesWithSource[1].cue as CueDto).vttCue.text).toEqual("Editing Line 2");
        expect((cuesWithSource[1].sourceCue as CueDto).vttCue.text).toEqual("Source Line 2");
    });

    it("shows cues in captioning mode", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTrack} currentPlayerTime={0} />
            </Provider >
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.setProps({}); // re-render component

        // THEN
        expect(actualNode.find(AddCueLineButton).length).toEqual(0);
        const cuesWithSource = actualNode.find("ReactSmartScroll").props().data as {} as CueWithSource[];
        expect((cuesWithSource[0].cue as CueDto).vttCue.text).toEqual("Editing Line 1");
        expect(cuesWithSource[0].sourceCue).toBeUndefined();
        expect((cuesWithSource[1].cue as CueDto).vttCue.text).toEqual("Editing Line 2");
        expect(cuesWithSource[1].sourceCue).toBeUndefined();
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
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
            </Provider >
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        actualNode.setProps({}); // re-render component

        // THEN
        const cuesWithSource = actualNode.find("ReactSmartScroll").props().data as {} as CueWithSource[];
        expect((cuesWithSource[0].cue as CueDto).vttCue.text).toEqual("Editing Line 1");
        expect((cuesWithSource[0].sourceCue as CueDto).vttCue.text).toEqual("Source Line 1");
        expect((cuesWithSource[1].cue as CueDto).vttCue.text).toEqual("Editing Line 2");
        expect((cuesWithSource[1].sourceCue as CueDto).vttCue.text).toEqual("Source Line 2");
        expect(cuesWithSource[2].cue).toBeUndefined();
        expect((cuesWithSource[2].sourceCue as CueDto).vttCue.text).toEqual("Source Line 3");
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
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
            </Provider >
        );
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        actualNode.setProps({}); // re-render component

        // THEN
        const cuesWithSource = actualNode.find("ReactSmartScroll").props().data as {} as CueWithSource[];
        expect((cuesWithSource[0].cue as CueDto).vttCue.text).toEqual("Editing Line 1");
        expect((cuesWithSource[0].sourceCue as CueDto).vttCue.text).toEqual("Source Line 1");
        expect((cuesWithSource[1].cue as CueDto).vttCue.text).toEqual("Editing Line 2");
        expect((cuesWithSource[1].sourceCue as CueDto).vttCue.text).toEqual("Source Line 2");
        expect(actualNode.find(CueLine).at(2)).toEqual({});
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
            <Provider store={testingStore}>
                <CuesList editingTrack={testingDirectTranslationTrack} currentPlayerTime={0} />
            </Provider >
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.setProps({}); // re-render component

        // THEN
        expect(actualNode.find(AddCueLineButton).length).toEqual(0);
        const cuesWithSource = actualNode.find("ReactSmartScroll").props().data as {} as CueWithSource[];
        expect((cuesWithSource[0].cue as CueDto).vttCue.text).toEqual("Editing Line 1");
        expect(cuesWithSource[0].sourceCue as CueDto).toBeUndefined();
        expect((cuesWithSource[1].cue as CueDto).vttCue.text).toEqual("Editing Line 2");
        expect(cuesWithSource[1].sourceCue as CueDto).toBeUndefined();
        expect((cuesWithSource[2].cue as CueDto).vttCue.text).toEqual("Editing Line 3");
        expect(cuesWithSource[2].sourceCue as CueDto).toBeUndefined();
    });

    it("shows starts captioning button for empty direct translation track", () => {
        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingDirectTranslationTrack} currentPlayerTime={0} />
            </Provider >
        );
        testingStore.dispatch(updateCues([]) as {} as AnyAction);
        actualNode.setProps({}); // re-render component

        // THEN
        expect(actualNode.find(AddCueLineButton).length).toEqual(1);
        expect(actualNode.find(CueLine).length).toEqual(0);
    });

    it("does not show starts captioning button for translation track empty source cues", () => {
        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
            </Provider >
        );
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues([]) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues([]) as {} as AnyAction);
        actualNode.setProps({}); // re-render component

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
            <Provider store={testingStore}>
                <CuesList
                    editingTrack={testingTranslationTrack}
                    currentPlayerTime={0}
                />
            </Provider >
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
        simulateEnoughSpaceForCues(actualNode);
        actualNode.setProps({}); // re-render component
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
            <Provider store={testingStore}>
                <CuesList
                    editingTrack={testingTranslationTrack}
                    currentPlayerTime={0}
                />
            </Provider >
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
        simulateEnoughSpaceForCues(actualNode);
        actualNode.setProps({}); // re-render component
        actualNode.find(CueLine).at(2).simulate("click");

        // THEN
        expect(testingStore.getState().cues.length).toEqual(3);
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("");
        expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(2);
        expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(3);
    });

    it("passes down properties via row props object", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTrack} currentPlayerTime={5.5} />
            </Provider >
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
        simulateEnoughSpaceForCues(actualNode);
        actualNode.setProps({}); // re-render component

        // THEN
        const cueLines = actualNode.find(CueLine);
        expect(cueLines.at(0).props().rowProps.cuesLength).toEqual(2);
        expect(cueLines.at(0).props().rowProps.playerTime).toEqual(5.5);
        expect(cueLines.at(1).props().rowProps.cuesLength).toEqual(2);
        expect(cueLines.at(1).props().rowProps.playerTime).toEqual(5.5);
    });

    it("doesn't scroll to non-last cue in editing mode", () => {
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        // WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTrack} currentPlayerTime={0} />
            </Provider >
        );

        // THEN
        // @ts-ignore ReactSmartScroll doesn't have TS signatures + it would fail if undefined
        expect(actualNode.find("ReactSmartScroll").props().startAt).toEqual(2);
    });

    it("scrolls to last cue", () => {
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        // WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTrack} currentPlayerTime={0} />
            </Provider >
        );

        // THEN
        // @ts-ignore ReactSmartScroll doesn't have TS signatures + it would fail if undefined
        expect(actualNode.find("ReactSmartScroll").props().startAt).toEqual(2);
    });

    it("scrolls to first cue", () => {
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        // WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTrack} currentPlayerTime={0} />
            </Provider >
        );

        // THEN
        // @ts-ignore ReactSmartScroll doesn't have TS signatures + it would fail if undefined
        expect(actualNode.find("ReactSmartScroll").props().startAt).toEqual(0);
    });

    it("adds first cue if clicked translation cue and cues are empty", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
            { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
        ];

        testingStore.dispatch(updateCues([]) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTrack} currentPlayerTime={0} />
            </Provider >
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
        const cues = [
            { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
            { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
        ];
        testingStore.dispatch(updateCues([]) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTrack} currentPlayerTime={0} />
            </Provider >
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

    it("configures row height for captioning mode", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTrack} currentPlayerTime={0} />
            </Provider >
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.setProps({}); // re-render component

        // THEN
        const smartScroll = actualNode.find("ReactSmartScroll");
        // @ts-ignore
        expect(smartScroll.props().rowHeight).toEqual(81);
    });

    it("configures row height for translation mode", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingTrack} currentPlayerTime={0} />
            </Provider >
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        actualNode.setProps({}); // re-render component

        // THEN
        const smartScroll = actualNode.find("ReactSmartScroll");
        // @ts-ignore
        expect(smartScroll.props().rowHeight).toEqual(161);
    });
});
