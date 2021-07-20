import "../../../testUtils/initBrowserEnvironment";
import React, { ReactElement } from "react";
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import { render } from "@testing-library/react";

import { CueDto, Language, ScrollPosition, Task, Track } from "../../model";
import { updateEditingTrack, updateTask } from "../../trackSlices";
import CueLine, { CueLineProps } from "../cueLine/CueLine";
import { updateCues } from "./cuesListActions";
import CuesList from "./CuesList";
import { createTestingStore } from "../../../testUtils/testingStore";
import { simulateEnoughSpaceForCues } from "../../../testUtils/testUtils";
import { reset } from "../edit/editorStatesSlice";
import { act } from "react-dom/test-utils";
import { changeScrollPosition } from "./cuesListScrollSlice";
import { Character } from "../../utils/shortcutConstants";
import { updateSourceCues } from "../view/sourceCueSlices";
import { updateEditingCueIndex } from "../edit/cueEditorSlices";

jest.mock(
    "../cueLine/CueLine",
    () => (props: CueLineProps): ReactElement => <div>CueLine: {JSON.stringify(props)}</div>
);

let testingStore = createTestingStore();

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

const testingDirectTranslationTrack = {
    type: "TRANSLATION",
    language: { id: "fr-FR", name: "French (France)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
} as Track;

const testingTask = {
    type: "TASK_CAPTION",
    projectName: "Project One",
    dueDate: "2019/12/30 10:00AM",
    editDisabled: false
} as Task;

describe("CuesList", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(reset() as {} as AnyAction);
    });

    describe("pagination", () => {
        const testingMatchedCuesForPagination = Array.from({ length: 120 }, (index: number) => ({
            targetCues: [{
                index,
                cue: {
                    vttCue: new VTTCue(index, index + 1, "Caption Line " + index),
                    cueCategory: "DIALOGUE"
                } as CueDto
            }],
            sourceCues: [{
                index,
                cue: {
                    vttCue: new VTTCue(index, index + 1, "Translation Line 1" + index),
                    cueCategory: "DIALOGUE"
                } as CueDto
            }]
        }));
        const testingTargetCuesForPagination = testingMatchedCuesForPagination
            .map(mappedCueLine => mappedCueLine.targetCues[0].cue);

        it("renders first page and focused cue 0", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingTargetCuesForPagination) as {} as AnyAction);
            // const cuesInRedux = testingStore.getState().cues;

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} currentPlayerTime={0} />
                </Provider >
            );

            // THEN
            console.log(actualNode.container.outerHTML);
        });
    });

    describe("captioning", () => {
        it("renders captions only", () => {
            // GIVEN
            const cues = [
                { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            const cuesInRedux = testingStore.getState().cues;
            const cuesWithIndexes = [
                { index: 0, cue: cuesInRedux[0] },
                { index: 1, cue: cuesInRedux[1] },
                { index: 2, cue: cuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [cuesWithIndexes[0]], sourceCues: []},
                { targetCues: [cuesWithIndexes[1]], sourceCues: []},
                { targetCues: [cuesWithIndexes[2]], sourceCues: []},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                        <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                            <CueLine
                                data={{ targetCues: [cuesWithIndexes[0]], sourceCues: []}}
                                rowIndex={0}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues:true, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [cuesWithIndexes[1]], sourceCues: []}}
                                rowIndex={1}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues:true, matchedCues }}
                            />
                        </div >
                    </div >
                </Provider >
            );

            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} currentPlayerTime={0} />
                </Provider >
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders all cues when there is enough space in viewport", () => {
            // GIVEN
            const cues = [
                { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            const cuesInRedux = testingStore.getState().cues;
            const cuesWithIndexes = [
                { index: 0, cue: cuesInRedux[0] },
                { index: 1, cue: cuesInRedux[1] },
                { index: 2, cue: cuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [cuesWithIndexes[0]], sourceCues: []},
                { targetCues: [cuesWithIndexes[1]], sourceCues: []},
                { targetCues: [cuesWithIndexes[2]], sourceCues: []},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                        <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                            <CueLine
                                data={{ targetCues: [cuesWithIndexes[0]], sourceCues: []}}
                                rowIndex={0}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues:true, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [cuesWithIndexes[1]], sourceCues: []}}
                                rowIndex={1}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues:true, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [cuesWithIndexes[2]], sourceCues: []}}
                                // @ts-ignore This parameter is added by smart scroll
                                height={81}
                                rowIndex={2}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues:true, matchedCues }}
                            />
                        </div >
                    </div >
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingCaptionTrack} currentPlayerTime={0} />
                </Provider >
            );
            simulateEnoughSpaceForCues(actualNode);

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });
    });

    describe("direct translation", () => {
        it("renders", () => {
            // GIVEN
            const cues = [
                { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            const cuesInRedux = testingStore.getState().cues;
            const cuesWithIndexes = [
                { index: 0, cue: cuesInRedux[0] },
                { index: 1, cue: cuesInRedux[1] },
                { index: 2, cue: cuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [cuesWithIndexes[0]], sourceCues: []},
                { targetCues: [cuesWithIndexes[1]], sourceCues: []},
                { targetCues: [cuesWithIndexes[2]], sourceCues: []},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                        <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                            <CueLine
                                data={{ targetCues: [cuesWithIndexes[0]], sourceCues: []}}
                                rowIndex={0}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues:true, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [cuesWithIndexes[1]], sourceCues: []}}
                                rowIndex={1}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues:true, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [cuesWithIndexes[2]], sourceCues: []}}
                                // @ts-ignore This parameter is added by smart scroll
                                height={81}
                                rowIndex={2}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues:true, matchedCues }}
                            />
                        </div >
                    </div >
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingDirectTranslationTrack} currentPlayerTime={0} />
                </Provider >
            );
            simulateEnoughSpaceForCues(actualNode);

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });
    });

    describe("time matching for translation mode", () => {
        it("exact time match of translation cues", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
                { index: 1, cue: targetCuesInRedux[1] },
                { index: 2, cue: targetCuesInRedux[2] }
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
                { index: 2, cue: sourceCuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]},
                { targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                        <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={0}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]}}
                                rowIndex={1}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]}}
                                // @ts-ignore This parameter is added by smart scroll
                                height={180}
                                rowIndex={2}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                        </div >
                    </div >
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
                </Provider >
            );
            simulateEnoughSpaceForCues(actualNode);

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("match when there are no translation cues created so far", () => {
            // GIVEN
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
                { index: 2, cue: sourceCuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[1]]},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[2]]},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                        <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={0}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 0, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[1]]}}
                                rowIndex={1}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 0, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[2]]}}
                                // @ts-ignore This parameter is added by smart scroll
                                height={180}
                                rowIndex={2}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 0, withoutSourceCues: false, matchedCues }}
                            />
                        </div >
                    </div >
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
                </Provider >
            );
            simulateEnoughSpaceForCues(actualNode);

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("3 lines, 1 source cue, 3 target cues", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
                { index: 1, cue: targetCuesInRedux[1] },
                { index: 2, cue: targetCuesInRedux[2] }
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
            ];
            const matchedCues = [
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: []},
                { targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[2]], sourceCues: []},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                        <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: []}}
                                rowIndex={0}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={1}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[2]], sourceCues: []}}
                                // @ts-ignore This parameter is added by smart scroll
                                height={180}
                                rowIndex={2}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                        </div >
                    </div >
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
                </Provider >
            );
            simulateEnoughSpaceForCues(actualNode);

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("4 lines, 1 source cue, 3 target cues", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Target Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
                { index: 1, cue: targetCuesInRedux[1] },
                { index: 2, cue: targetCuesInRedux[2] }
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
            ];
            const matchedCues = [
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: []},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[1]], sourceCues: []},
                { targetCues: [targetCuesWithIndexes[2]], sourceCues: []},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                        <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: []}}
                                rowIndex={0}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={1}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[1]], sourceCues: []}}
                                // @ts-ignore This parameter is added by smart scroll
                                height={180}
                                rowIndex={2}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[2]], sourceCues: []}}
                                // @ts-ignore This parameter is added by smart scroll
                                height={180}
                                rowIndex={3}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                        </div >
                    </div >
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
                </Provider >
            );
            simulateEnoughSpaceForCues(actualNode);

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("3 lines, 3 source cues, 1 target cue", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
                { index: 2, cue: sourceCuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[1]]},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[2]]},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                        <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={0}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[1]]}}
                                rowIndex={1}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[2]]}}
                                // @ts-ignore This parameter is added by smart scroll
                                height={180}
                                rowIndex={2}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                            />
                        </div >
                    </div >
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
                </Provider >
            );
            simulateEnoughSpaceForCues(actualNode);

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("4 lines, 3 source cues, 1 target cue", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
                { index: 2, cue: sourceCuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: []},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[1]]},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[2]]},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                        <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={0}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: []}}
                                rowIndex={1}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[1]]}}
                                // @ts-ignore This parameter is added by smart scroll
                                height={180}
                                rowIndex={2}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[2]]}}
                                // @ts-ignore This parameter is added by smart scroll
                                height={180}
                                rowIndex={3}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                            />
                        </div >
                    </div >
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
                </Provider >
            );
            simulateEnoughSpaceForCues(actualNode);

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("1 line, 1 source cue, 3 target cues", () => {
            // GIVEN
            const sourceCues = [
                { vttCue: new VTTCue(0, 3, "Source Line 1"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
                { index: 1, cue: targetCuesInRedux[1] },
                { index: 2, cue: targetCuesInRedux[2] }
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [{ index: 0, cue: sourceCuesInRedux[0] }];
            const matchedCues = [{ targetCues: targetCuesWithIndexes, sourceCues: sourceCuesWithIndexes }];

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                        <div style={{ paddingBottom: "17px", paddingTop: "0px" }}>
                            <CueLine
                                data={{ targetCues: targetCuesWithIndexes, sourceCues: sourceCuesWithIndexes }}
                                rowIndex={0}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                        </div >
                    </div >
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
                </Provider >
            );
            simulateEnoughSpaceForCues(actualNode);

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("1 line, 3 source cues, 1 target cues", () => {
            // GIVEN
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const targetCues = [
                { vttCue: new VTTCue(0, 3, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
                { index: 2, cue: sourceCuesInRedux[2] }
            ];
            const matchedCues = [{ targetCues: targetCuesWithIndexes, sourceCues: sourceCuesWithIndexes }];

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                        <div style={{ paddingBottom: "17px", paddingTop: "0px" }}>
                            <CueLine
                                data={{ targetCues: targetCuesWithIndexes, sourceCues: sourceCuesWithIndexes }}
                                rowIndex={0}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                            />
                        </div >
                    </div >
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
                </Provider >
            );
            simulateEnoughSpaceForCues(actualNode);

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("same middle time, source cue longer", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(1, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Target Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(1, 1.5, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1.5, 3.5, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3.5, 4, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
                { index: 1, cue: targetCuesInRedux[1] },
                { index: 2, cue: targetCuesInRedux[2] }
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
                { index: 2, cue: sourceCuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]},
                { targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                        <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={0}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]}}
                                rowIndex={1}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]}}
                                // @ts-ignore This parameter is added by smart scroll
                                height={180}
                                rowIndex={2}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                        </div >
                    </div >
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
                </Provider >
            );
            simulateEnoughSpaceForCues(actualNode);

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("same middle time, target cue longer", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(1, 1.5, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1.5, 3.5, "Target Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3.5, 4, "Target Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(1, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
                { index: 1, cue: targetCuesInRedux[1] },
                { index: 2, cue: targetCuesInRedux[2] }
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
                { index: 2, cue: sourceCuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]},
                { targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                        <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={0}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]}}
                                rowIndex={1}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]}}
                                // @ts-ignore This parameter is added by smart scroll
                                height={180}
                                rowIndex={2}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                            />
                        </div >
                    </div >
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
                </Provider >
            );
            simulateEnoughSpaceForCues(actualNode);

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("uses 65% overlap mechanism", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(21.979, 22.055, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(22.414, 25.209, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(21.674, 23.656, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(24.024, 24.504, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
                { index: 1, cue: targetCuesInRedux[1] },
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
            ];
            const matchedCues = [
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                        <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={0}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 2, withoutSourceCues: false, matchedCues }}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]}}
                                rowIndex={1}
                                rowRef={React.createRef()}
                                rowProps={{ playerTime: 0, targetCuesLength: 2, withoutSourceCues: false, matchedCues }}
                            />
                        </div >
                    </div >
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
                </Provider >
            );
            simulateEnoughSpaceForCues(actualNode);

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });
    });

    it("shows starts captioning button for empty direct translation track", async () => {
        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingDirectTranslationTrack} currentPlayerTime={0} />
            </Provider >
        );
        await act(async () => {
            testingStore.dispatch(updateCues([]) as {} as AnyAction);
        });

        // THEN
        expect(actualNode.container.outerHTML).toContain("Start Captioning");
        expect(actualNode.container.outerHTML).not.toContain("CueLine");
    });

    it("scrolls to last cue", async() => {
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(3, 4, "Caption Line 4"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(4, 5, "Caption Line 5"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(5, 6, "Caption Line 6"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(6, 7, "Caption Line 7"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const actualNode = render(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingCaptionTrack} currentPlayerTime={0} />
            </Provider >
        );
        simulateEnoughSpaceForCues(actualNode, 100);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        // WHEN
        await act(async () => {
            testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
        });
        await act(async () => {
            actualNode.container.querySelector(".sbte-smart-scroll")?.dispatchEvent(new Event("scroll"));
        });

        // THEN
        expect(actualNode.container.outerHTML).toContain("Caption Line 7");
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
        const actualNode = render(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingCaptionTrack} currentPlayerTime={0} />
            </Provider >
        );
        simulateEnoughSpaceForCues(actualNode, 100);
        await act(async () => {
            testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
        });
        await act(async () => {
            actualNode.container.querySelector(".sbte-smart-scroll")?.dispatchEvent(new Event("scroll"));
        });

        // WHEN
        testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
        await act(async () => {
            actualNode.container.querySelector(".sbte-smart-scroll")?.dispatchEvent(new Event("scroll"));
        });

        // THEN
        expect(actualNode.container.outerHTML).toContain("Caption Line 1");
    });

    it("scrolls to current editing cue if not in viewport", async () => {
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
                <CuesList editingTrack={testingCaptionTrack} currentPlayerTime={0} />
            </Provider >
        );
        simulateEnoughSpaceForCues(actualNode, 100);
        await act(async () => {
            testingStore.dispatch(changeScrollPosition(ScrollPosition.LAST) as {} as AnyAction);
        });
        await act(async () => {
            actualNode.container.querySelector(".sbte-smart-scroll")?.dispatchEvent(new Event("scroll"));
        });

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);
        await act(async () => {
            actualNode.container.querySelector(".sbte-smart-scroll")?.dispatchEvent(new Event("scroll"));
        });

        // THEN
        expect(actualNode.container.outerHTML).toContain("Caption Line 3");
    });

    it("adds first cue when ENTER is pressed", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            sourceLanguage: { id: "en-US", name: "English", direction: "LTR" } as Language,
            language: { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language,
            default: true,
            mediaTitle: "Sample Polish",
            mediaLength: 4000,
            progress: 50
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        render(
            <Provider store={testingStore}>
                <CuesList editingTrack={testingDirectTranslationTrack} currentPlayerTime={0} />
            </Provider >
        );
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ENTER });

        // THEN
        expect(testingStore.getState().cues.length).toEqual(1);
        expect(testingStore.getState().editingCueIndex).toEqual(0);
    });
});
