/**  * @jest-environment jsdom-sixteen  */
// TODO Remove above when we update to react-scripts with Jest 26:
// https://github.com/facebook/create-react-app/pull/8362
// eslint-disable-next-line
// https://stackoverflow.com/questions/61036156/react-typescript-testing-typeerror-mutationobserver-is-not-a-constructor#comment110029314_61039444

import "../../../testUtils/initBrowserEnvironment";
import React, { createRef } from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";

import { CueDto, Language, ScrollPosition, Task, Track } from "../../model";
import { updateCues, updateVttCue } from "./cuesListActions";
import { updateSourceCues } from "../view/sourceCueSlices";
import CuesList from "./CuesList";
import { createTestingStore } from "../../../testUtils/testingStore";
import { reset } from "../edit/editorStatesSlice";
import { updateEditingCueIndex } from "../edit/cueEditorSlices";
import { updateEditingTrack, updateTask } from "../../trackSlices";
import { changeScrollPosition, scrollPositionSlice } from "./cuesListScrollSlice";
import { act } from "react-dom/test-utils";
import CueLine from "../cueLine/CueLine";
import { removeDraftJsDynamicValues } from "../../../testUtils/testUtils";
import AddCueLineButton from "../edit/AddCueLineButton";
import { matchedCuesSlice } from "./cuesListSlices";

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

const matchedCues = Array.from({ length: 120 }, (_element, index) => (
    {
        sourceCues: [
            {
                index,
                cue: {
                    vttCue: new VTTCue(index, index + 1, "Source Line " + index),
                    cueCategory: "DIALOGUE"
                } as CueDto
            }
        ],
        targetCues: [
            {
                index,
                cue: {
                    vttCue: new VTTCue(index, index + 1, "Target Line " + index),
                    cueCategory: "DIALOGUE"
                } as CueDto
            }
        ],
    }
));

const targetCues = matchedCues.map(matchedCue => matchedCue.targetCues)
    .flat()
    .map(cueWithIndex => cueWithIndex.cue);
const sourceCues = matchedCues.map(matchedCue => matchedCue.sourceCues)
    .flat()
    .map(cueWithIndex => cueWithIndex.cue);


describe("CuesList", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(reset() as {} as AnyAction);
        jest.resetAllMocks();
    });

    describe("renders", () => {
        it("empty track", () => {
            // GIVEN
            const expectedNode = render(
                <Provider store={testingStore}>
                    <AddCueLineButton text="Start Captioning" cueIndex={-1} sourceCueIndexes={[]} />
                    <div style={{ overflow: "auto" }} />
                </Provider>
            );

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} commentAuthor="Linguist" />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
                .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
        });

        it("without pagination", () => {
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
            const matchedCuesShort = [
                { targetCues: [{ index: 0, cue: targetCues[0] }], sourceCues: [{ index: 0, cue: sourceCues[0] }]},
                { targetCues: [{ index: 1, cue: targetCues[1] }], sourceCues: [{ index: 1, cue: sourceCues[1] }]},
                { targetCues: [{ index: 2, cue: targetCues[2] }], sourceCues: [{ index: 2, cue: sourceCues[2] }]},
            ];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div style={{ overflow: "auto" }}>
                        <CueLine
                            key={0}
                            data={matchedCuesShort[0]}
                            rowIndex={0}
                            rowProps={{
                                targetCuesLength: 3,
                                withoutSourceCues: false,
                                matchedCues: matchedCuesShort,
                                commentAuthor: "Linguist"
                            }}
                            rowRef={createRef()}
                        />
                        <CueLine
                            key={1}
                            data={matchedCuesShort[1]}
                            rowIndex={1}
                            rowProps={{
                                targetCuesLength: 3,
                                withoutSourceCues: false,
                                matchedCues: matchedCuesShort,
                                commentAuthor: "Linguist"
                            }}
                            rowRef={createRef()}
                        />
                        <CueLine
                            key={2}
                            data={matchedCuesShort[2]}
                            rowIndex={2}
                            rowProps={{
                                targetCuesLength: 3,
                                withoutSourceCues: false,
                                matchedCues: matchedCuesShort,
                                commentAuthor: "Linguist"
                            }}
                            rowRef={createRef()}
                        />
                    </div>
                </Provider>
            );

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} commentAuthor="Linguist" />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
                .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
        });

        it("first page", () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div style={{ overflow: "auto" }}>
                        {
                            Array.from({ length: 55 }, (_element, index) => (
                                <CueLine
                                    key={index}
                                    data={matchedCues[index]}
                                    rowIndex={index}
                                    rowProps={{
                                        targetCuesLength: 120,
                                        withoutSourceCues: false,
                                        matchedCues,
                                        commentAuthor: "Linguist"
                                    }}
                                    rowRef={createRef()}
                                />
                            ))
                        }
                        <button
                            style={{ width: "100%", paddingTop: "5px" }}
                            className="btn btn-outline-secondary sbte-next-button shadow-none"
                            onClick={jest.fn()}
                        >
                            Load Next Cues
                        </button>
                    </div>
                </Provider>
            );

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} commentAuthor="Linguist" />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
                .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
        });

        it("middle page", () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(52) as {} as AnyAction);

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div style={{ overflow: "auto" }}>
                        <button
                            style={{ maxHeight: "38px", width: "100%", marginBottom: "5px" }}
                            className="btn btn-outline-secondary sbte-previous-button shadow-none"
                            onClick={jest.fn()}
                        >
                            Load Previous Cues
                        </button>
                        {
                            Array.from({ length: 60 }, (_element, index) => (
                                <CueLine
                                    key={index + 45}
                                    data={matchedCues[index + 45]}
                                    rowIndex={index + 45}
                                    rowProps={{
                                        targetCuesLength: 120,
                                        withoutSourceCues: false,
                                        matchedCues,
                                        commentAuthor: "Linguist"
                                    }}
                                    rowRef={createRef()}
                                />
                            ))
                        }
                        <button
                            style={{ width: "100%", paddingTop: "5px" }}
                            className="btn btn-outline-secondary sbte-next-button shadow-none"
                            onClick={jest.fn()}
                        >
                            Load Next Cues
                        </button>
                    </div>
                </Provider>
            );

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} commentAuthor="Linguist" />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
                .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
        });

        it("last page", () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(102) as {} as AnyAction);

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div style={{ overflow: "auto" }}>
                        <button
                            style={{ maxHeight: "38px", width: "100%", marginBottom: "5px" }}
                            className="btn btn-outline-secondary sbte-previous-button shadow-none"
                            onClick={jest.fn()}
                        >
                            Load Previous Cues
                        </button>
                        {
                            Array.from({ length: 25 }, (_element, index) => (
                                <CueLine
                                    key={index + 95}
                                    data={matchedCues[index + 95]}
                                    rowIndex={index + 95}
                                    rowProps={{
                                        targetCuesLength: 120,
                                        withoutSourceCues: false,
                                        matchedCues,
                                        commentAuthor: "Linguist"
                                    }}
                                    rowRef={createRef()}
                                />
                            ))
                        }
                    </div>
                </Provider>
            );

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} commentAuthor="Linguist" />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
                .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
        });
    });

    describe("pagination button", () => {
        it("'Load previous Cues' scrolls to previous page", () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(102) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} commentAuthor="Linguist" />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelector(".sbte-previous-button") as Element);

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(99);
        });

        it("'Load Previous Cues' scrolls to previous page if focusedCueIndex is null", async () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(102) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} commentAuthor="Linguist" />
                </Provider>
            );
            await act(async () => {
                actualNode.container.querySelector("div")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                actualNode.container.querySelector("div")?.dispatchEvent(new Event("scroll"));
            });

            // WHEN
            await act(async () => {
                fireEvent.click(actualNode.container.querySelector(".sbte-previous-button") as Element);
            });

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(99);
        });

        it("'Load Next Cues' scrolls to next page", () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(52) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} commentAuthor="Linguist" />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelector(".sbte-next-button") as Element);

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(100);
        });

        it("'Load Next Cues' scrolls to next page is focused cue index is null", async () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(52) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} commentAuthor="Linguist" />
                </Provider>
            );
            await act(async () => {
                actualNode.container.querySelector("div")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                actualNode.container.querySelector("div")?.dispatchEvent(new Event("scroll"));
            });

            // WHEN
            await act(async () => {
                fireEvent.click(actualNode.container.querySelector(".sbte-next-button") as Element);
            });

            // THEN
            expect(testingStore.getState().focusedCueIndex).toEqual(100);
        });
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
                    <CuesList editingTrack={testingTranslationTrack} commentAuthor="Linguist" />
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
                    <CuesList editingTrack={testingTranslationTrack} commentAuthor="Linguist" />
                </Provider>
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).not.toContain("Target Line 0");
            expect(scrolledElement.outerHTML).toContain("Target Line 1");
            expect(scrolledElement.outerHTML).not.toContain("Target Line 2");
        });
    });

    describe("pagination based on editing cue index", () => {
        it("renders first page and editing cue 0", () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Target Line 0");
            expect(actualNode.container.outerHTML).toContain("Target Line 0");
            expect(actualNode.container.outerHTML).toContain("Target Line 49");
        });

        it("renders first page and editing cue 49", () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(49) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Target Line 49");
            expect(actualNode.container.outerHTML).toContain("Target Line 0");
            expect(actualNode.container.outerHTML).toContain("Target Line 49");
        });

        it("renders second page and editing cue 50", () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(50) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Target Line 50");
            expect(actualNode.container.outerHTML).toContain("Target Line 50");
            expect(actualNode.container.outerHTML).toContain("Target Line 99");
        });

        it("renders third page and editing cue 111", () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(111) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Target Line 111");
            expect(actualNode.container.outerHTML).toContain("Target Line 100");
            expect(actualNode.container.outerHTML).toContain("Target Line 119");
        });
    });

    describe("pagination based on focused cue index", () => {
        it("renders first page and focused cue 0", () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(scrollPositionSlice.actions.changeFocusedCueIndex(0) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Target Line 0");
            expect(actualNode.container.outerHTML).toContain("Target Line 0");
            expect(actualNode.container.outerHTML).toContain("Target Line 49");
        });

        it("renders first page and focused cue 49", () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(scrollPositionSlice.actions.changeFocusedCueIndex(49) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Target Line 49");
            expect(actualNode.container.outerHTML).toContain("Target Line 0");
            expect(actualNode.container.outerHTML).toContain("Target Line 49");
        });

        it("renders second page and focused cue 50", () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(50) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Target Line 50");
            expect(actualNode.container.outerHTML).toContain("Target Line 50");
            expect(actualNode.container.outerHTML).toContain("Target Line 99");
        });

        it("renders third page and focused cue 111", () => {
            // GIVEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(scrollPositionSlice.actions.changeFocusedCueIndex(111) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
                </Provider >
            );

            // THEN
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            expect(scrolledElement.outerHTML).toContain("Target Line 111");
            expect(actualNode.container.outerHTML).toContain("Target Line 100");
            expect(actualNode.container.outerHTML).toContain("Target Line 119");
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
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
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
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
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
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
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
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
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
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(3);
            const scrolledElement1 = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrolledElement1.outerHTML).toContain("Caption Line 119");
            const scrolledElement2 = scrollIntoViewCallsTracker.mock.calls[1][0];
            expect(scrolledElement2.outerHTML).toContain("Caption Line 119");
            const scrolledElement3 = scrollIntoViewCallsTracker.mock.calls[2][0];
            expect(scrolledElement3.outerHTML).toContain("Caption Line 119");
        });

        it("prevent loosing page index when ficused cue index is null", async () => {
            const testingSourceCuesForPagination = Array.from({ length: 120 }, (_element, index) => (
                { vttCue: new VTTCue(index, index + 1, "Caption Line " + index), cueCategory: "DIALOGUE" } as CueDto
            ));
            testingStore.dispatch(updateCues(testingSourceCuesForPagination) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
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

    describe("handles correctly complicated edge cases", () => {
        it("doesn't save editor change to next cue when cue is quickly deleted after text updates", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
                </Provider>
            );

            // WHEN
            const editor = actualNode.container.querySelector(".public-DraftEditor-content") as Element;
            fireEvent.paste(editor, {
                clipboardData: {
                    types: ["text/plain"],
                    getData: (): string => " Paste text to end",
                }
            });
            fireEvent.click(actualNode.container.querySelector(".sbte-delete-cue-button") as Element);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("Target Line 1");
            expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[0].cue.vttCue.text)
                .toEqual("Target Line 1");
        });

        it("does save editor change if text is being written and user quickly hits Enter", async () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);
            testingStore.dispatch(updateVttCue(0, new VTTCue(0, 1, "Target Line 0 edited")) as {} as AnyAction);

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
                </Provider>
            );

            // WHEN
            const editor = actualNode.container.querySelector(".public-DraftEditor-content") as Element;
            fireEvent.paste(editor, {
                clipboardData: {
                    types: ["text/plain"],
                    getData: (): string => " Paste text to end",
                }
            });
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("Target Line 0 edited Paste text to end");
            expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[0].cue.vttCue.text)
                .toEqual("Target Line 0 edited Paste text to end");
            expect(actualNode.container.outerHTML).toContain("Target Line 0 edited Paste text to end");
        });

        it("renders changed value if user edits and quickly navigates away for newly created caption cue", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);
            const editor = actualNode.container.querySelector(".public-DraftEditor-content") as Element;
            fireEvent.paste(editor, {
                clipboardData: {
                    types: ["text/plain"],
                    getData: (): string => " Paste text to end",
                }
            });
            testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.text).toEqual(" Paste text to end");
            expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[0].cue.vttCue.text)
                .toEqual(" Paste text to end");
            expect(actualNode.container.outerHTML).toContain(" Paste text to end");
        });

        it("renders changed value if user edits and quickly navigates away for newly created translated cue", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(1, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 0"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(matchedCuesSlice.actions.matchCuesByTime(
                { cues: targetCues, sourceCues, editingCueIndex: -1 }
            ) as {} as AnyAction);
            testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);

            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} commentAuthor="Linguist" />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);
            const editor = actualNode.container.querySelector(".public-DraftEditor-content") as Element;
            fireEvent.paste(editor, {
                clipboardData: {
                    types: ["text/plain"],
                    getData: (): string => " Paste text to end",
                }
            });
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().cues[0].vttCue.text).toEqual(" Paste text to end");
            expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[0].cue.vttCue.text)
                .toEqual(" Paste text to end");
            expect(actualNode.container.outerHTML).toContain(" Paste text to end");
        });

        it("remains scroll into view working if cues are imported", async () => {
            // GIVEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} commentAuthor="Linguist" />
                </Provider>
            );

            // WHEN
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(50) as {} as AnyAction);
            await act(async () => {
                actualNode.container.querySelector("div")?.dispatchEvent(new Event("scroll"));
            });
            await act(async () => {
                actualNode.container.querySelector("div")?.dispatchEvent(new Event("scroll"));
            });

            // THEN
            expect(scrollIntoViewCallsTracker.mock.calls.length).toEqual(1);
            const scrolledElement = scrollIntoViewCallsTracker.mock.calls[0][0];
            expect(scrolledElement.outerHTML).toContain("Target Line 50");
        });
    });
});
