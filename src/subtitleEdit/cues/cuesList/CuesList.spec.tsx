/**  * @jest-environment jsdom-sixteen  */
// TODO Remove above when we update to react-scripts with Jest 26:
// https://github.com/facebook/create-react-app/pull/8362
// eslint-disable-next-line
// https://stackoverflow.com/questions/61036156/react-typescript-testing-typeerror-mutationobserver-is-not-a-constructor#comment110029314_61039444

import "../../../testUtils/initBrowserEnvironment";
import React from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";

import { CueDto, Language, ScrollPosition, Task, Track } from "../../model";
import { updateCues } from "./cuesListActions";
import { updateSourceCues } from "../view/sourceCueSlices";
import CuesList from "./CuesList";
import { createTestingStore } from "../../../testUtils/testingStore";
import { reset } from "../edit/editorStatesSlice";
import { updateEditingCueIndex } from "../edit/cueEditorSlices";
import { updateTask } from "../../trackSlices";
import { changeScrollPosition, scrollPositionSlice } from "./cuesListScrollSlice";
import { act } from "react-dom/test-utils";

const scrollIntoViewCallsTracker = jest.fn();

/**
 * Can't use arrow syntax here, because need to use 'this' keyword for tracking caller element.
 * Inspired by https://github.com/jsdom/jsdom/issues/1695#issuecomment-438245889
 */
Element.prototype.scrollIntoView = function (): void {
    scrollIntoViewCallsTracker(this);
};

const testingTask = {
    type: "TASK_CAPTION",
    projectName: "Project One",
    dueDate: "2019/12/30 10:00AM",
    editDisabled: false
} as Task;

const testingCaptionTrack = {
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

let testingStore = createTestingStore();

describe("CuesList", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(reset() as {} as AnyAction);
        jest.resetAllMocks();
    });

    describe("scrolling into view", () => {
        it("starts at correct focused cue index when times are synced in translation mode", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

            // WHEN
            render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} />
                </Provider>
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).not.toContain("Target Line 0");
            expect(scrolledElement.outerHTML).not.toContain("Target Line 1");
            expect(scrolledElement.outerHTML).toContain("Target Line 2");
        });

        it("starts at correct focused cue index when target cue end time is shorter", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(1, 1.5, "Target Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1.5, 3.5, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3.5, 4, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(1, 2, "Source Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];


            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // WHEN
            render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} />
                </Provider>
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).not.toContain("Target Line 0");
            expect(scrolledElement.outerHTML).toContain("Target Line 1");
            expect(scrolledElement.outerHTML).not.toContain("Target Line 2");
        });

        // TODO: test also multi matches this way
    });

    describe("pagination based on editing cue index", () => {
        const testingSourceCuesForPagination = Array.from({ length: 120 }, (_element, index) => (
            { vttCue: new VTTCue(index, index + 1, "Caption Line " + index), cueCategory: "DIALOGUE" } as CueDto
        ));

        const testingTargetCuesForPagination = Array.from({ length: 120 }, (_element, index) => ({
            vttCue: new VTTCue(index, index + 1, "Translation Line " + index),
            cueCategory: "DIALOGUE"
        } as CueDto));

        it("renders first page and editing cue 0", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Translation Line 0");
            expect(actualNode.container.outerHTML).toContain("Translation Line 0");
            expect(actualNode.container.outerHTML).toContain("Translation Line 49");
        });

        it("renders first page and editing cue 49", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(49) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Translation Line 49");
            expect(actualNode.container.outerHTML).toContain("Translation Line 0");
            expect(actualNode.container.outerHTML).toContain("Translation Line 49");
        });

        it("renders second page and editing cue 50", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(50) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Translation Line 50");
            expect(actualNode.container.outerHTML).toContain("Translation Line 50");
            expect(actualNode.container.outerHTML).toContain("Translation Line 99");
        });

        it("renders third page and editing cue 111", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(111) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Translation Line 111");
            expect(actualNode.container.outerHTML).toContain("Translation Line 100");
            expect(actualNode.container.outerHTML).toContain("Translation Line 119");
        });
    });

    describe("pagination based on focused cue index", () => {
        const testingSourceCuesForPagination = Array.from({ length: 120 }, (_element, index) => (
            { vttCue: new VTTCue(index, index + 1, "Caption Line " + index), cueCategory: "DIALOGUE" } as CueDto
        ));

        const testingTargetCuesForPagination = Array.from({ length: 120 }, (_element, index) => ({
            vttCue: new VTTCue(index, index + 1, "Translation Line " + index),
            cueCategory: "DIALOGUE"
        } as CueDto));

        it("renders first page and focused cue 0", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(scrollPositionSlice.actions.changeFocusedCueIndex(0) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Translation Line 0");
            expect(actualNode.container.outerHTML).toContain("Translation Line 0");
            expect(actualNode.container.outerHTML).toContain("Translation Line 49");
        });

        it("renders first page and focused cue 49", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(scrollPositionSlice.actions.changeFocusedCueIndex(49) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Translation Line 49");
            expect(actualNode.container.outerHTML).toContain("Translation Line 0");
            expect(actualNode.container.outerHTML).toContain("Translation Line 49");
        });

        it("renders second page and focused cue 50", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(50) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Translation Line 50");
            expect(actualNode.container.outerHTML).toContain("Translation Line 50");
            expect(actualNode.container.outerHTML).toContain("Translation Line 99");
        });

        it("renders third page and focused cue 111", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(testingSourceCuesForPagination) as {} as AnyAction);
            testingStore.dispatch(scrollPositionSlice.actions.changeFocusedCueIndex(111) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Translation Line 111");
            expect(actualNode.container.outerHTML).toContain("Translation Line 100");
            expect(actualNode.container.outerHTML).toContain("Translation Line 119");
        });
    });

    describe("jumps", () => {
        it("scrolls to last cue", async () => {
            const cues = [
                { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Caption Line 4"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4, 5, "Caption Line 5"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(5, 6, "Caption Line 6"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(6, 7, "Caption Line 7"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} />
                </Provider>
            );

            // WHEN
            await act(async () => {
                testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
            });

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrolledElement.outerHTML).toContain("Caption Line 7");
            expect(testingStore.getState().focusedCueIndex).toEqual(6);
        });

        it("scrolls to first cue", async () => {
            const cues = [
                { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Caption Line 4"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4, 5, "Caption Line 5"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(5, 6, "Caption Line 6"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(6, 7, "Caption Line 7"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} />
                </Provider>
            );

            // WHEN
            await act(async () => {
                testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            });

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrolledElement.outerHTML).toContain("Caption Line 1");
            expect(testingStore.getState().focusedCueIndex).toEqual(0);
        });

        it("scrolls to last cue twice in a row", async () => {
            const cues = [
                { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Caption Line 4"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4, 5, "Caption Line 5"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(5, 6, "Caption Line 6"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(6, 7, "Caption Line 7"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} />
                </Provider>
            );

            // WHEN
            await act(async () => {
                testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
            });
            await act(async () => {
                actualNode.container.querySelector("div")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                actualNode.container.querySelector("div")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
            });

            // THEN
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(2);
            const scrolledElement1 = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrolledElement1.outerHTML).toContain("Caption Line 7");
            const scrolledElement2 = scrollIntoViewCallsTracker.mock.calls[1][0];
            expect(scrolledElement2.outerHTML).toContain("Caption Line 7");
            expect(testingStore.getState().focusedCueIndex).toEqual(6);
        });

        it("scrolls to last cue on different page twice in a row", async () => {
            const testingSourceCuesForPagination = Array.from({ length: 120 }, (_element, index) => (
                { vttCue: new VTTCue(index, index + 1, "Caption Line " + index), cueCategory: "DIALOGUE" } as CueDto
            ));
            testingStore.dispatch(updateCues(testingSourceCuesForPagination) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} />
                </Provider>
            );

            // WHEN
            await act(async () => {
                testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
            });
            await act(async () => {
                actualNode.container.querySelector("div")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                actualNode.container.querySelector("div")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
            });

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(119);
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(4);
            const scrolledElement1 = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrolledElement1.outerHTML).toContain("Caption Line 119");
            const scrolledElement2 = scrollIntoViewCallsTracker.mock.calls[1][0];
            expect(scrolledElement2.outerHTML).toContain("Caption Line 119");
            const scrolledElement3 = scrollIntoViewCallsTracker.mock.calls[2][0];
            expect(scrolledElement3.outerHTML).toContain("Caption Line 119");
            const scrolledElement4 = scrollIntoViewCallsTracker.mock.calls[3][0];
            expect(scrolledElement4.outerHTML).toContain("Caption Line 119");
        });

        it("prevent loosing page index when ficused cue index is null", async () => {
            const testingSourceCuesForPagination = Array.from({ length: 120 }, (_element, index) => (
                { vttCue: new VTTCue(index, index + 1, "Caption Line " + index), cueCategory: "DIALOGUE" } as CueDto
            ));
            testingStore.dispatch(updateCues(testingSourceCuesForPagination) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} />
                </Provider>
            );

            // WHEN
            await act(async () => {
                testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
            });
            await act(async () => {
                actualNode.container.querySelector("div")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                actualNode.container.querySelector("div")?.dispatchEvent(new Event("scroll"));
            });

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(null);
            expect(actualNode.container.querySelector("div")?.outerHTML).toContain("Caption Line 119");
            expect(actualNode.container.querySelector("div")?.outerHTML).toContain("Caption Line 100");
        });
    });
});
