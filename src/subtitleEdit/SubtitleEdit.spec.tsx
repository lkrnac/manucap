import "../testUtils/initBrowserEnvironment";
import React, { ReactElement } from "react";
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import { mount } from "enzyme";
import { fireEvent, render } from "@testing-library/react";
import ReactDOM from "react-dom";

import { CueDto, Language, ScrollPosition, Task, Track } from "./model";
import {
    removeDraftJsDynamicValues,
    removeVideoPlayerDynamicValue,
} from "../testUtils/testUtils";
import { updateCues, updateVttCue } from "./cues/cuesList/cuesListActions";
import { updateEditingTrack, updateTask } from "./trackSlices";
import CueLine from "./cues/cueLine/CueLine";
import SubtitleEdit from "./SubtitleEdit";
import { SubtitleSpecification } from "./toolbox/model";
import Toolbox from "./toolbox/Toolbox";
import VideoPlayer from "./player/VideoPlayer";
import { createTestingStore } from "../testUtils/testingStore";
import { readSubtitleSpecification } from "./toolbox/subtitleSpecifications/subtitleSpecificationSlice";
import { reset } from "./cues/edit/editorStatesSlice";
import AddCueLineButton from "./cues/edit/AddCueLineButton";
import { callSaveTrack, SaveState, setSaveTrack } from "./cues/saveSlices";
import * as cuesListScrollSlice from "./cues/cuesList/cuesListScrollSlice";
import { showSearchReplace } from "./cues/searchReplace/searchReplaceSlices";
import SearchReplaceEditor from "./cues/searchReplace/SearchReplaceEditor";
import KeyboardShortcuts from "./toolbox/keyboardShortcuts/KeyboardShortcuts";
import SubtitleSpecificationsButton from "./toolbox/subtitleSpecifications/SubtitleSpecificationsButton";
import ShiftTimeButton from "./toolbox/shift/ShiftTimeButton";
import CaptionOverlapToggle from "./toolbox/CaptionOverlapToggle";
import ExportTrackCuesButton from "./toolbox/export/ExportTrackCuesButton";
import ImportTrackCuesButton from "./toolbox/ImportTrackCuesButton";
import SearchReplaceButton from "./toolbox/SearchReplaceButton";
import { updateSourceCues } from "./cues/view/sourceCueSlices";
import { lastCueChangeSlice } from "./cues/edit/cueEditorSlices";
import MergeCuesButton from "./toolbox/MergeCuesButton";
import { showMerge } from "./cues/merge/mergeSlices";
import MergeEditor from "./cues/merge/MergeEditor";
import { act } from "react-dom/test-utils";
import CueCommentsToggle from "./toolbox/CueCommentsToggle";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback,
    isEmpty: jest.requireActual("lodash/isEmpty")
}));

// eslint-disable-next-line react/display-name
jest.mock("./cues/CueErrorAlert", () => (): ReactElement => <div>CueErrorAlert</div>);

Element.prototype.scrollIntoView = jest.fn();

let testingStore = createTestingStore();

const cues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
] as CueDto[];

const cuesWithIndexes = [
    { index: 0, cue: cues[0] },
    { index: 1, cue: cues[1] },
];

const matchedCues = [
    { targetCues: [cuesWithIndexes[0]], sourceCues: []},
    { targetCues: [cuesWithIndexes[1]], sourceCues: []},
];

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

const testingTask = {
    type: "TASK_CAPTION",
    projectName: "Project One",
    dueDate: "2019/12/30 10:00AM",
    editDisabled: false
} as Task;

const testingTranslationTask = {
    type: "TASK_TRANSLATE",
    projectName: "Project One",
    dueDate: "2019/12/30 10:00AM",
    editDisabled: false
} as Task;

const testingCompletedTask = {
    type: "TASK_CAPTION",
    projectName: "Project One",
    dueDate: "2019/12/30 10:00AM",
    editDisabled: true
} as Task;

jest.setTimeout(9000);

describe("SubtitleEdit", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(reset() as {} as AnyAction);
    });
    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore} >
                <div
                    className="sbte-subtitle-edit"
                    style={{ display: "flex", flexFlow: "column", padding: "10px",  height: "100%" }}
                >
                    <div>CueErrorAlert</div>
                    <header style={{ display: "flex", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                            <div><b>This is the video title</b> <i>Project One</i></div>
                            <div>Caption in: <b>English (US)</b> <span><i>4 seconds</i></span></div>
                        </div>
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                            <div>Completed: <b>50%</b></div>
                        </div>
                    </header>
                    <div style={{ display: "flex", alignItems: "flex-start", height: "93%" }}>
                        <div style={{ display: "flex", flex: "1 1 40%", flexFlow: "column", paddingRight: "10px" }}>
                            <div className="video-player-wrapper">
                                <VideoPlayer
                                    mp4="dummyMp4"
                                    poster="dummyPoster"
                                    tracks={[testingTrack]}
                                    languageCuesArray={[]}
                                    lastCueChange={null}
                                />
                            </div>
                            <Toolbox
                                handleImportFile={jest.fn()}
                                handleExportSourceFile={jest.fn()}
                                handleExportFile={jest.fn()}
                            />
                        </div>
                        <div
                            style={{
                                flex: "1 1 60%",
                                height: "100%",
                                paddingLeft: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <div style={{ overflow: "auto" }}>
                                <CueLine
                                    data={{ targetCues: [cuesWithIndexes[0]]}}
                                    rowIndex={0}
                                    rowProps={{
                                        targetCuesLength: 2,
                                        withoutSourceCues: true,
                                        matchedCues,
                                        commentAuthor: "Linguist"
                                    }}
                                    rowRef={React.createRef()}
                                />
                                <CueLine
                                    data={{ targetCues: [cuesWithIndexes[1]]}}
                                    rowIndex={1}
                                    rowProps={{
                                        targetCuesLength: 2,
                                        withoutSourceCues: true,
                                        matchedCues,
                                        commentAuthor: "Linguist"
                                    }}
                                    rowRef={React.createRef()}
                                />
                            </div>
                            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
                                <button className="btn btn-primary sbte-view-all-tracks-btn" type="button">
                                    View All Tracks
                                </button>
                                <button
                                    className="btn btn-secondary sbte-jump-to-first-button"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-angle-double-up" />
                                </button>
                                <button
                                    className="btn btn-secondary sbte-jump-to-last-button"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-angle-double-down" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-edit-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-edit" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-playback-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-video" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-last-translated-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    hidden={testingTrack.type !== "TRANSLATION"}
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-language" />
                                </button>
                                <span style={{ flexGrow: 2 }} />
                                <div
                                    style={{ "textAlign": "center", "margin": "8px 10px 0px 0px", fontWeight: "bold" }}
                                >
                                    <span hidden className=""> &nbsp;<i className="" /></span>
                                </div>
                                <button type="button" className="btn btn-primary sbte-complete-subtitle-btn">
                                    Complete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        // THEN
        expect(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(actualNode.container.outerHTML)))
            .toEqual(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(expectedNode.container.outerHTML)));
    });

    it("renders with no cues and add cue button for CAPTION track", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore} >
                <div
                    className="sbte-subtitle-edit"
                    style={{ display: "flex", flexFlow: "column", padding: "10px",  height: "100%" }}
                >
                    <div>CueErrorAlert</div>
                    <header style={{ display: "flex", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                            <div><b>This is the video title</b> <i>Project One</i></div>
                            <div>Caption in: <b>English (US)</b> <span><i>4 seconds</i></span></div>
                        </div>
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                            <div>Completed: <b>0%</b></div>
                        </div>
                    </header>
                    <div style={{ display: "flex", alignItems: "flex-start", height: "93%" }}>
                        <div style={{ display: "flex", flex: "1 1 40%", flexFlow: "column", paddingRight: "10px" }}>
                            <div className="video-player-wrapper">
                                <VideoPlayer
                                    mp4="dummyMp4"
                                    poster="dummyPoster"
                                    tracks={[testingTrack]}
                                    languageCuesArray={[]}
                                    lastCueChange={null}
                                />
                            </div>
                            <Toolbox
                                handleExportSourceFile={jest.fn()}
                                handleExportFile={jest.fn()}
                                handleImportFile={jest.fn()}
                            />
                        </div>
                        <div
                            style={{
                                flex: "1 1 60%",
                                height: "100%",
                                paddingLeft: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <AddCueLineButton
                                text="Start Captioning"
                                cueIndex={-1}
                                sourceCueIndexes={[]}
                            />
                            <div style={{ overflow: "auto" }} />
                            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
                                <button className="btn btn-primary sbte-view-all-tracks-btn" type="button">
                                    View All Tracks
                                </button>
                                <button
                                    className="btn btn-secondary sbte-jump-to-first-button"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-angle-double-up" />
                                </button>
                                <button
                                    className="btn btn-secondary sbte-jump-to-last-button"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-angle-double-down" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-edit-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-edit" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-playback-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-video" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-last-translated-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    hidden={testingTrack.type !== "TRANSLATION"}
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-language" />
                                </button>
                                <span style={{ flexGrow: 2 }} />
                                <div
                                    style={{ "textAlign": "center", "margin": "8px 10px 0px 0px", fontWeight: "bold" }}
                                >
                                    <span hidden className=""> &nbsp;<i className="" /></span>
                                </div>
                                <button type="button" className="btn btn-primary sbte-complete-subtitle-btn">
                                    Complete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack({ ...testingTrack, progress: 0 }) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // THEN
        expect(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(actualNode.html())))
            .toEqual(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(expectedNode.html())));
    });

    it("renders loading data when data is pending load for CAPTION", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore} >
                <div
                    className="sbte-subtitle-edit"
                    style={{ display: "flex", flexFlow: "column", padding: "10px",  height: "100%" }}
                >
                    <div>CueErrorAlert</div>
                    <header style={{ display: "flex", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                            <div><b>This is the video title</b> <i>Project One</i></div>
                            <div>Caption in: <b>English (US)</b> <span><i>4 seconds</i></span></div>
                        </div>
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                            <div />
                        </div>
                    </header>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%",
                        backgroundColor: "white" }}
                    >
                        <div style={{ width: "350px", height: "25px", display: "flex", alignItems: "center" }}>
                            <i className="fas fa-sync fa-spin" style={{ fontSize: "3em", fontWeight: 900 }} />
                            <span style={{ marginLeft: "15px" }}>Hang in there, we&apos;re loading the track...</span>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );

        // THEN
        expect(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(actualNode.html())))
            .toEqual(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(expectedNode.html())));
    });

    it("renders loading data when data is pending load for TRANSLATION source cues", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore} >
                <div
                    className="sbte-subtitle-edit"
                    style={{ display: "flex", flexFlow: "column", padding: "10px",  height: "100%" }}
                >
                    <div>CueErrorAlert</div>
                    <header style={{ display: "flex", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                            <div><b>This is the video title</b> <i>Project One</i></div>
                            <div>
                                Translation from <span><b>English (US)</b> to <b>French (France)</b></span>{" "}
                                <span><i>4 seconds</i></span>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                            <div />
                        </div>
                    </header>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%",
                        backgroundColor: "white" }}
                    >
                        <div style={{ width: "350px", height: "25px", display: "flex", alignItems: "center" }}>
                            <i className="fas fa-sync fa-spin" style={{ fontSize: "3em", fontWeight: 900 }} />
                            <span style={{ marginLeft: "15px" }}>Hang in there, we&apos;re loading the track...</span>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTranslationTask) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // THEN
        expect(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(actualNode.html())))
            .toEqual(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(expectedNode.html())));
    });

    it("renders with search and replace pane", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore} >
                <div
                    className="sbte-subtitle-edit"
                    style={{ display: "flex", flexFlow: "column", padding: "10px",  height: "100%" }}
                >
                    <div>CueErrorAlert</div>
                    <header style={{ display: "flex", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                            <div><b>This is the video title</b> <i>Project One</i></div>
                            <div>Caption in: <b>English (US)</b> <span><i>4 seconds</i></span></div>
                        </div>
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                            <div>Completed: <b>50%</b></div>
                        </div>
                    </header>
                    <div style={{ display: "flex", alignItems: "flex-start", height: "93%" }}>
                        <div style={{ display: "flex", flex: "1 1 40%", flexFlow: "column", paddingRight: "10px" }}>
                            <div className="video-player-wrapper">
                                <VideoPlayer
                                    mp4="dummyMp4"
                                    poster="dummyPoster"
                                    tracks={[testingTrack]}
                                    languageCuesArray={[]}
                                    lastCueChange={null}
                                />
                            </div>
                            <Toolbox
                                handleImportFile={jest.fn()}
                                handleExportSourceFile={jest.fn()}
                                handleExportFile={jest.fn()}
                            />
                        </div>
                        <div
                            style={{
                                flex: "1 1 60%",
                                height: "100%",
                                paddingLeft: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <SearchReplaceEditor />
                            <div style={{ overflow: "auto" }}>
                                <CueLine
                                    rowIndex={0}
                                    data={{ targetCues: [cuesWithIndexes[0]]}}
                                    rowProps={{
                                        targetCuesLength: 2,
                                        withoutSourceCues: true,
                                        matchedCues,
                                        commentAuthor: "Linguist"
                                    }}
                                    rowRef={React.createRef()}
                                />
                                <CueLine
                                    rowIndex={1}
                                    data={{ targetCues: [cuesWithIndexes[1]]}}
                                    rowProps={{
                                        targetCuesLength: 2,
                                        withoutSourceCues: true,
                                        matchedCues,
                                        commentAuthor: "Linguist"
                                    }}
                                    rowRef={React.createRef()}
                                />
                            </div>
                            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
                                <button className="btn btn-primary sbte-view-all-tracks-btn" type="button">
                                    View All Tracks
                                </button>
                                <button
                                    className="btn btn-secondary sbte-jump-to-first-button"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-angle-double-up" />
                                </button>
                                <button
                                    className="btn btn-secondary sbte-jump-to-last-button"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-angle-double-down" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-edit-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-edit" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-playback-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-video" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-last-translated-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    hidden={testingTrack.type !== "TRANSLATION"}
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-language" />
                                </button>
                                <span style={{ flexGrow: 2 }} />
                                <div
                                    style={{ "textAlign": "center", "margin": "8px 10px 0px 0px", fontWeight: "bold" }}
                                >
                                    <span hidden className=""> &nbsp;<i className="" /></span>
                                </div>
                                <button type="button" className="btn btn-primary sbte-complete-subtitle-btn">
                                    Complete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

        // THEN
        expect(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(actualNode.container.outerHTML)))
            .toEqual(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(expectedNode.container.outerHTML)));
    });

    it("renders with merge pane", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore} >
                <div
                    className="sbte-subtitle-edit"
                    style={{ display: "flex", flexFlow: "column", padding: "10px",  height: "100%" }}
                >
                    <div>CueErrorAlert</div>
                    <header style={{ display: "flex", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                            <div><b>This is the video title</b> <i>Project One</i></div>
                            <div>Caption in: <b>English (US)</b> <span><i>4 seconds</i></span></div>
                        </div>
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                            <div>Completed: <b>50%</b></div>
                        </div>
                    </header>
                    <div style={{ display: "flex", alignItems: "flex-start", height: "93%" }}>
                        <div style={{ display: "flex", flex: "1 1 40%", flexFlow: "column", paddingRight: "10px" }}>
                            <div className="video-player-wrapper">
                                <VideoPlayer
                                    mp4="dummyMp4"
                                    poster="dummyPoster"
                                    tracks={[testingTrack]}
                                    languageCuesArray={[]}
                                    lastCueChange={null}
                                />
                            </div>
                            <Toolbox
                                handleImportFile={jest.fn()}
                                handleExportSourceFile={jest.fn()}
                                handleExportFile={jest.fn()}
                            />
                        </div>
                        <div
                            style={{
                                flex: "1 1 60%",
                                height: "100%",
                                paddingLeft: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <MergeEditor />
                            <div style={{ overflow: "auto" }}>
                                <CueLine
                                    rowIndex={0}
                                    data={{ targetCues: [cuesWithIndexes[0]]}}
                                    rowProps={{
                                        targetCuesLength: 2,
                                        withoutSourceCues: true,
                                        matchedCues
                                    }}
                                    rowRef={React.createRef()}
                                />
                                <CueLine
                                    rowIndex={1}
                                    data={{ targetCues: [cuesWithIndexes[1]]}}
                                    rowProps={{
                                        targetCuesLength: 2,
                                        withoutSourceCues: true,
                                        matchedCues
                                    }}
                                    rowRef={React.createRef()}
                                />
                            </div>
                            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
                                <button className="btn btn-primary sbte-view-all-tracks-btn" type="button">
                                    View All Tracks
                                </button>
                                <button
                                    className="btn btn-secondary sbte-jump-to-first-button"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-angle-double-up" />
                                </button>
                                <button
                                    className="btn btn-secondary sbte-jump-to-last-button"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-angle-double-down" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-edit-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-edit" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-playback-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-video" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-last-translated-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    hidden={testingTrack.type !== "TRANSLATION"}
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-language" />
                                </button>
                                <span style={{ flexGrow: 2 }} />
                                <div
                                    style={{ "textAlign": "center", "margin": "8px 10px 0px 0px", fontWeight: "bold" }}
                                >
                                    <span hidden className=""> &nbsp;<i className="" /></span>
                                </div>
                                <button type="button" className="btn btn-primary sbte-complete-subtitle-btn">
                                    Complete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(showMerge(true) as {} as AnyAction);

        // THEN
        expect(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(actualNode.container.outerHTML)))
            .toEqual(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(expectedNode.container.outerHTML)));
    });

    it("renders for task with edit disabled", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore} >
                <div
                    className="sbte-subtitle-edit"
                    style={{ display: "flex", flexFlow: "column", padding: "10px",  height: "100%" }}
                >
                    <div>CueErrorAlert</div>
                    <header style={{ display: "flex", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                            <div><b>This is the video title</b> <i>Project One</i></div>
                            <div>Caption in: <b>English (US)</b> <span><i>4 seconds</i></span></div>
                        </div>
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                            <div>Completed: <b>50%</b></div>
                        </div>
                    </header>
                    <div style={{ display: "flex", alignItems: "flex-start", height: "93%" }}>
                        <div style={{ display: "flex", flex: "1 1 40%", flexFlow: "column", paddingRight: "10px" }}>
                            <div className="video-player-wrapper">
                                <VideoPlayer
                                    mp4="dummyMp4"
                                    poster="dummyPoster"
                                    tracks={[testingTrack]}
                                    languageCuesArray={[]}
                                    lastCueChange={null}
                                />
                            </div>
                            <Accordion defaultActiveKey="0" style={{ marginTop: "10px" }} className="sbte-toolbox">
                                <Card>
                                    <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                                        Toolbox
                                    </Accordion.Toggle>
                                    <Accordion.Collapse eventKey="0">
                                        <Card.Body>
                                            <ButtonToolbar className="sbte-button-toolbar">
                                                <KeyboardShortcuts />
                                                <SubtitleSpecificationsButton />
                                                <ShiftTimeButton />
                                                <CaptionOverlapToggle />
                                                <ExportTrackCuesButton handleExport={jest.fn()} />
                                                <ImportTrackCuesButton handleImport={jest.fn()} disabled />
                                                <SearchReplaceButton />
                                                <MergeCuesButton />
                                                <CueCommentsToggle />
                                            </ButtonToolbar>
                                        </Card.Body>
                                    </Accordion.Collapse>
                                </Card>
                            </Accordion>
                        </div>
                        <div
                            style={{
                                flex: "1 1 60%",
                                height: "100%",
                                paddingLeft: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <div style={{ overflow: "auto" }}>
                                <CueLine
                                    rowIndex={0}
                                    data={{ targetCues: [cuesWithIndexes[0]]}}
                                    rowProps={{
                                        targetCuesLength: 2,
                                        withoutSourceCues: true,
                                        matchedCues,
                                        commentAuthor: "Linguist"
                                    }}
                                    rowRef={React.createRef()}
                                />
                                <CueLine
                                    rowIndex={1}
                                    data={{ targetCues: [cuesWithIndexes[1]]}}
                                    rowProps={{
                                        targetCuesLength: 2,
                                        withoutSourceCues: true,
                                        matchedCues,
                                        commentAuthor: "Linguist"
                                    }}
                                    rowRef={React.createRef()}
                                />
                            </div>
                            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
                                <button className="btn btn-primary sbte-view-all-tracks-btn" type="button">
                                    View All Tracks
                                </button>
                                <button
                                    className="btn btn-secondary sbte-jump-to-first-button"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-angle-double-up" />
                                </button>
                                <button
                                    className="btn btn-secondary sbte-jump-to-last-button"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >

                                    <i className="fa fa-angle-double-down" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-edit-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-edit" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-playback-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-video" />
                                </button>
                                <button
                                    data-testid="sbte-jump-to-last-translated-cue-button"
                                    className="btn btn-secondary"
                                    type="button"
                                    hidden={testingTrack.type !== "TRANSLATION"}
                                    style={{ marginLeft: "10px" }}
                                    onClick={(): void => undefined}
                                >
                                    <i className="fa fa-language" />
                                </button>
                                <span style={{ flexGrow: 2 }} />
                                <div
                                    style={{ "textAlign": "center", "margin": "8px 10px 0px 0px", fontWeight: "bold" }}
                                >
                                    <span className="text-success">Edits are disabled, task is already completed</span>
                                </div>
                                <button type="button" disabled className="btn btn-primary sbte-complete-subtitle-btn">
                                    Complete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingCompletedTask) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        // THEN
        expect(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(actualNode.html())))
            .toEqual(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(expectedNode.html())));
    });

    it("calls onViewAllTrack callback when button is clicked", () => {
        // GIVEN
        const mockOnViewAllTracks = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={mockOnViewAllTracks}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.update();

        // WHEN
        actualNode.find("button.sbte-view-all-tracks-btn").simulate("click");

        // THEN
        expect(mockOnViewAllTracks.mock.calls.length).toBe(1);
    });

    it("calls onComplete callback when button is clicked", () => {
        // GIVEN
        const mockOnComplete = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={mockOnComplete}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.update();

        // WHEN
        actualNode.find("button.sbte-complete-subtitle-btn").simulate("click");

        // THEN
        expect(mockOnComplete).toHaveBeenCalledWith(
            { editingTrack: testingStore.getState().editingTrack, cues: testingStore.getState().cues });
    });

    it("calls onExportFile callback when button is clicked", () => {
        // GIVEN
        const mockOnExportFile = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={mockOnExportFile}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.update();

        // WHEN
        actualNode.find(".sbte-export-button").simulate("click");

        // THEN
        expect(mockOnExportFile).toHaveBeenCalled();
    });

    it("calls onExportSourceFile callback when button is clicked", () => {
        // GIVEN
        const mockOnExportSourceFile = jest.fn();
        const actualNode = render(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={mockOnExportSourceFile}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTranslationTask) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(cues) as {} as AnyAction);

        // WHEN
        fireEvent.click(actualNode.getByText("Export Source File"));

        // THEN
        expect(mockOnExportSourceFile).toHaveBeenCalled();
    });

    it("calls onImportFile callback when button is clicked", () => {
        // GIVEN
        const mockOnImportFile = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={mockOnImportFile}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.update();

        // WHEN
        actualNode.find(".sbte-import-button").simulate("click");

        // THEN
        expect(mockOnImportFile).toHaveBeenCalled();
    });

    it("jump to last cue in captioning mode", () => {
        // GIVEN
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        // changeScrollPosition.mockImplementation(() => {});
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewAllTracks={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        // WHEN
        actualNode.find(".sbte-jump-to-last-button").simulate("click");

        // THEN
        expect(changeScrollPositionSpy).toBeCalledTimes(1);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.LAST);
    });

    it("jump to last cue in translation mode", () => {
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
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewAllTracks={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        // WHEN
        actualNode.find(".sbte-jump-to-last-button").simulate("click");

        // THEN
        expect(changeScrollPositionSpy).toBeCalledTimes(1);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.LAST);
    });

    it("jumps to first cue when button is clicked", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewAllTracks={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        actualNode.find(".sbte-jump-to-last-button").simulate("click");
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        // WHEN
        actualNode.find(".sbte-jump-to-first-button").simulate("click");

        // THEN
        expect(changeScrollPositionSpy).toBeCalledTimes(1);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.FIRST);
    });

    it("jumps to first cue on first render", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        // WHEN
        mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewAllTracks={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(changeScrollPositionSpy).toBeCalledTimes(1);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.FIRST);
    });

    it("jumps to current edit cue when button is clicked", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewAllTracks={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        fireEvent.click(actualNode.container.querySelector(".sbte-jump-to-last-button") as HTMLElement);
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        // WHEN
        fireEvent.click(actualNode.getByTestId("sbte-jump-to-edit-cue-button"));

        // THEN
        expect(changeScrollPositionSpy).toBeCalledTimes(1);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.CURRENT);
    });

    it("jumps to playback cue when button is clicked", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewAllTracks={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        fireEvent.click(actualNode.container.querySelector(".sbte-jump-to-last-button") as HTMLElement);
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        fireEvent.click(actualNode.getByTestId("sbte-jump-to-playback-cue-button"));

        // THEN
        expect(changeScrollPositionSpy).toBeCalledTimes(1);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.PLAYBACK);
    });

    it("jump to last translated subtitle button clicked", async () => {
        // GIVEN
        const cues = [] as CueDto[];
        const cueSize = 50;
        for (let idx = 0; idx < cueSize; idx++) {
            cues.push({ vttCue: new VTTCue(idx, idx + 1, `Editing Line ${idx + 1}`), cueCategory: "DIALOGUE" });
        }
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewAllTracks={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        //WHEN
        await act(async () => {
            fireEvent.click(actualNode.getByTestId("sbte-jump-to-last-translated-cue-button"));
        });

        expect(actualNode.container.outerHTML).toContain(`Editing Line ${cueSize}`);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.LAST_TRANSLATED);
    });

    it("calls onSave callback on auto save", () => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);

        mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={saveTrack}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // WHEN
        callSaveTrack(testingStore.dispatch, testingStore.getState);

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });

    it("resets all editing track data when unmounted", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(cues) as {} as AnyAction);
        testingStore.dispatch(lastCueChangeSlice.actions.recordCueChange(
            { changeType: "EDIT", index: 0, vttCue: new VTTCue(0, 3, "blabla") }
        ));

        const { container } = render(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // WHEN
        ReactDOM.unmountComponentAtNode(container);

        // THEN
        expect(testingStore.getState().loadingIndicator.cuesLoaded).toBeFalsy();
        expect(testingStore.getState().loadingIndicator.sourceCuesLoaded).toBeFalsy();
        expect(testingStore.getState().editingTrack).toBeNull();
        expect(testingStore.getState().cues).toEqual([]);
        expect(testingStore.getState().sourceCues).toEqual([]);
        expect(testingStore.getState().saveTrack).toBeNull();
        expect(testingStore.getState().autoSaveSuccess).toBeFalsy();
        expect(testingStore.getState().saveAction.saveState).toEqual(SaveState.NONE);
        expect(testingStore.getState().saveAction.multiCuesEdit).toBeFalsy();
        expect(testingStore.getState().pendingSave).toBeFalsy();
        expect(testingStore.getState().lastCueChange).toEqual(null);
    });

    it("sets saveTrack when mounted", () => {
        // WHEN
        mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={jest.fn()}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(testingStore.getState().saveTrack).toBeDefined();
    });

    it("sets spell checker domain when mounted", () => {
        // WHEN
        mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={jest.fn()}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                    spellCheckerDomain="testing-domain"
                />
            </Provider>
        );

        // THEN
        expect(testingStore.getState().spellCheckerSettings.domain).toEqual("testing-domain");
    });

    it("remount EditingVideoPlayer when cues are loaded", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={jest.fn()}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingTrack({ ...testingTrack, progress: 0 }) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        for (let i = 0; i < 5; i++) {
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            actualNode.update();
        }

        // THEN
        expect(actualNode.find(".video-player-wrapper").key()).toEqual("5");
    });

    it("does not remount EditingVideoPlayer when cues are updated", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={jest.fn()}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack({ ...testingTrack, progress: 0 }) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        // WHEN
        testingStore.dispatch(updateVttCue(0, new VTTCue(2, 5, "Dummy Cue"),
            "editUuid") as {} as AnyAction);
        actualNode.update();

        // THEN
        expect(actualNode.find(".video-player-wrapper").key()).toEqual("1");
    });
});
