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
import { mount } from "enzyme";
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
    dueDate: "2019/12/30 10:00AM"
} as Task;

const testingTranslationTask = {
    type: "TASK_TRANSLATE",
    projectName: "Project One",
    dueDate: "2019/12/30 10:00AM"
} as Task;

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
                            />
                            <Toolbox />
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
                                <button className="btn btn-primary sbte-complete-subtitle-btn" type="button">
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
                            />
                            <Toolbox />
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
                            <div style={{ overflowY: "scroll", height: "100%" }} className="sbte-cues-array-container">
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
                                <button className="btn btn-primary sbte-complete-subtitle-btn" type="button">
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
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                />
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
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
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
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                />
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
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        actualNode.update();

        // THEN
        const cueLines = actualNode.find(CueLine);
        // console.log(actualNode.)
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
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingDirectTranslationTrack) as {} as AnyAction);
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
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingDirectTranslationTrack) as {} as AnyAction);
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
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                />
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
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
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
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
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
        expect(mockOnComplete.mock.calls.length).toBe(1);
    });

    it("jump to last cue in captioning mode", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewAllTracks={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.update();
        const cueLines = actualNode.find(CueLine);
        const domNode = cueLines.at(1).getDOMNode();
        const parentNode = domNode.parentNode;

        Object.defineProperty(parentNode, "offsetTop", { configurable: true, value: 30 });
        Object.defineProperty(domNode, "offsetTop", { configurable: true, value: 55 });

        // WHEN
        actualNode.find(".sbte-jump-to-last-button").simulate("click");

        // THEN
        expect(actualNode.find(".sbte-cues-array-container").getDOMNode().scrollTop).toEqual(25);
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
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewAllTracks={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        actualNode.update();
        const cueLines = actualNode.find(CueLine);
        const domNode = cueLines.at(1).getDOMNode();
        const parentNode = domNode.parentNode;

        Object.defineProperty(parentNode, "offsetTop", { configurable: true, value: 30 });
        Object.defineProperty(domNode, "offsetTop", { configurable: true, value: 55 });

        // WHEN
        actualNode.find(".sbte-jump-to-last-button").simulate("click");

        // THEN
        expect(actualNode.find(".sbte-cues-array-container").getDOMNode().scrollTop).toEqual(25);
    });

    it("jumps to first cue", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewAllTracks={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.update();
        const cueLines = actualNode.find(CueLine);
        const domNode = cueLines.at(0).getDOMNode();
        const parentNode = domNode.parentNode;

        Object.defineProperty(parentNode, "offsetTop", { configurable: true, value: 30 });
        Object.defineProperty(domNode, "offsetTop", { configurable: true, value: 55 });

        // WHEN
        actualNode.find(".sbte-jump-to-first-button").simulate("click");

        // THEN
        expect(actualNode.find(".sbte-cues-array-container").getDOMNode().scrollTop).toEqual(25);
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
                />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(callSaveTrack() as {} as AnyAction);

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });

    it("resets editing track and cues state when unmounted", () => {
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
