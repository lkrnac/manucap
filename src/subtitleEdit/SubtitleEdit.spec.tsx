import "../testUtils/initBrowserEnvironment";
import { CueDto, Language, Task, Track } from "./model";
import { removeDraftJsDynamicValues, removeVideoPlayerDynamicValue } from "../testUtils/testUtils";
import { setOverlapCaptions, updateCues, updateSourceCues } from "./cues/cueSlices";
import { updateEditingTrack, updateTask } from "./trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import CueLine from "./cues/CueLine";
import { Provider } from "react-redux";
import React from "react";
import SubtitleEdit from "./SubtitleEdit";
import { SubtitleSpecification } from "./toolbox/model";
import Toolbox from "./toolbox/Toolbox";
import VideoPlayer from "./player/VideoPlayer";
import { createTestingStore } from "../testUtils/testingStore";
import { mount, ReactWrapper } from "enzyme";
import { readSubtitleSpecification } from "./toolbox/subtitleSpecificationSlice";
import { reset } from "./cues/edit/editorStatesSlice";
import AddCueLineButton from "./cues/edit/AddCueLineButton";
import _ from "lodash";
import { callSaveTrack, setSaveTrack } from "./cues/saveSlices";
import { render } from "@testing-library/react";
import ReactDOM from "react-dom";

let testingStore = createTestingStore();

const cues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

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
    dueDate: "2019/12/30 10:00AM"
} as Task;

const testingTranslationTask = {
    type: "TASK_TRANSLATE",
    projectName: "Project One",
    dueDate: "2019/12/30 10:00AM"
} as Task;

const verifyScrollPosition = (
    actualNode: ReactWrapper,
    expectedPosition: number,
    cuesLength: number,
    done: Function
): void => {
    // @ts-ignore ReactSmartScroll doesn't have TS signatures + it would fail if undefined
    expect(actualNode.find("ReactSmartScroll").props().startAt).toEqual(cuesLength);
    setTimeout(
        () => {
            actualNode.setProps({}); // update + trigger re-render
            // @ts-ignore ReactSmartScroll doesn't have TS signatures + it would fail if undefined
            expect(actualNode.find("ReactSmartScroll").props().startAt).toEqual(expectedPosition);
            done();
        },
        50
    );
};

describe("SubtitleEdit", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(reset() as {} as AnyAction);
    });
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore} >
                <div
                    className="sbte-subtitle-edit"
                    style={{ display: "flex", flexFlow: "column", padding: "10px",  height: "100%" }}
                >
                    <header style={{ display: "flex", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div><b>This is the video title</b> <i>Project One</i></div>
                            <div>Caption in: <b>English (US)</b> <i>4 seconds</i></div>
                        </div>
                        <div style={{ flex: "2", position: "relative", height: "100%" }}>
                            <div
                                style={{ textAlign: "center", width: "100%", position: "absolute", bottom: "0" }}
                                className="sbte-light-gray-text"
                            >
                            </div>
                        </div>
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                            <div>Completed: <b>50%</b></div>
                        </div>
                    </header>
                    <div style={{ display: "flex", alignItems: "flex-start", height: "93%" }}>
                        <div style={{ display: "flex", flex: "1 1 40%", flexFlow: "column", paddingRight: "10px" }}>
                            <VideoPlayer
                                mp4="dummyMp4"
                                poster="dummyPoster"
                                tracks={[testingTrack]}
                                languageCuesArray={[]}
                                lastCueChange={null}
                            />
                            <Toolbox handleImportFile={jest.fn()} handleExportFile={jest.fn()} />
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
                            <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                                <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                                    <CueLine
                                        rowIndex={0}
                                        data={{ cue: cues[0] }}
                                        rowProps={{ playerTime: 0, cuesLength: 2 }}
                                        rowRef={React.createRef()}
                                        onClick={(): void => undefined}
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end" }}>
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
                                <span style={{ flexGrow: 2 }} />
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
        expect(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(actualNode.html())))
            .toEqual(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(expectedNode.html())));
    });

    it("renders with no cues and add cue button for CAPTION track", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore} >
                <div
                    className="sbte-subtitle-edit"
                    style={{ display: "flex", flexFlow: "column", padding: "10px",  height: "100%" }}
                >
                    <header style={{ display: "flex", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div><b>This is the video title</b> <i>Project One</i></div>
                            <div>Caption in: <b>English (US)</b> <i>4 seconds</i></div>
                        </div>
                        <div style={{ flex: "2", position: "relative", height: "100%" }}>
                            <div
                                style={{ textAlign: "center", width: "100%", position: "absolute", bottom: "0" }}
                                className="sbte-light-gray-text"
                            >
                            </div>
                        </div>
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                            <div>Completed: <b>0%</b></div>
                        </div>
                    </header>
                    <div style={{ display: "flex", alignItems: "flex-start", height: "93%" }}>
                        <div style={{ display: "flex", flex: "1 1 40%", flexFlow: "column", paddingRight: "10px" }}>
                            <VideoPlayer
                                mp4="dummyMp4"
                                poster="dummyPoster"
                                tracks={[testingTrack]}
                                languageCuesArray={[]}
                                lastCueChange={null}
                            />
                            <Toolbox handleExportFile={jest.fn()} handleImportFile={jest.fn()} />
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
                            />
                            <div className="sbte-smart-scroll" style={{ overflow: "auto" }}>
                                <div style={{ paddingBottom: "0px", paddingTop: "0px" }}>
                                </div>
                            </div>
                            <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end" }}>
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
                                <span style={{ flexGrow: 2 }} />
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
                    <header style={{ display: "flex", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div><b>This is the video title</b> <i>Project One</i></div>
                            <div>Caption in: <b>English (US)</b> <i>4 seconds</i></div>
                        </div>
                        <div style={{ flex: "2", position: "relative", height: "100%" }}>
                            <div
                                style={{ textAlign: "center", width: "100%", position: "absolute", bottom: "0" }}
                                className="sbte-light-gray-text"
                            >
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
                    <header style={{ display: "flex", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div><b>This is the video title</b> <i>Project One</i></div>
                            <div>
                                Translation from <span>
                                    <b>English (US)</b> to <b>French (France)</b>
                                </span> <i>4 seconds</i>{/* eslint-disable-line react/jsx-closing-tag-location */}
                            </div>
                        </div>
                        <div style={{ flex: "2", position: "relative", height: "100%" }}>
                            <div
                                style={{ textAlign: "center", width: "100%", position: "absolute", bottom: "0" }}
                                className="sbte-light-gray-text"
                            >
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
            { editingTrack: testingStore.getState().editingTrack, cues: testingStore.getState().cues});
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

    it("jump to last cue in captioning mode", (done) => {
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
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-jump-to-last-button").simulate("click");

        // THEN
        verifyScrollPosition(actualNode, 1, 2, done);
    });

    it("jump to last cue in translation mode", (done) => {
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
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-jump-to-last-button").simulate("click");

        // THEN
        verifyScrollPosition(actualNode, 2, 3, done);
    });

    it("jumps to first cue when button is clicked", (done) => {
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
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-jump-to-first-button").simulate("click");

        // THEN
        verifyScrollPosition(actualNode, 0, 2, done);
    });

    it("jumps to first cue on first render", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewAllTracks={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        // @ts-ignore ReactSmartScroll doesn't have TS signatures + it would fail if undefined
        expect(actualNode.find("ReactSmartScroll").props().startAt).toEqual(0);
    });

    it("calls onSave callback on auto save", () => {
        // GIVEN
        const saveTrack = jest.fn();
        // @ts-ignore
        jest.spyOn(_, "debounce").mockReturnValue(() => { saveTrack(); });
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

        mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={saveTrack}
                    onComplete={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(callSaveTrack() as {} as AnyAction);

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });

    it("resets all editing track data when unmounted", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(cues) as {} as AnyAction);
        testingStore.dispatch(setOverlapCaptions(true) as {} as AnyAction);

        const { container } = render(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
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
        expect(testingStore.getState().overlapCaptions).toBeFalsy();
    });
});
