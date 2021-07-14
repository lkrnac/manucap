import "../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { CueDto, Language, Task, Track } from "./model";
import { updateEditingTrack, updateTask } from "./trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import React from "react";
import SubtitleEditHeader from "./SubtitleEditHeader";
import { createTestingStore } from "../testUtils/testingStore";
import { mount } from "enzyme";
import { removeVideoPlayerDynamicValue } from "../testUtils/testUtils";
import { updateCues } from "./cues/cuesList/cuesListActions";

let testingStore = createTestingStore();

describe("SubtitleEditHeader", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
    it("renders Caption", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 125000,
            progress: 0
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Caption in: <b>English (US)</b> <span><i>2 minutes 5 seconds</i></span></div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                    <div>Completed: <b>0%</b></div>
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Translation", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
        } as Track;
        const testingTask = {
            type: "TASK_TRANSLATE",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Translation from <span><b>English (US)</b> to <b>Italian</b></span> <i /></div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                    <div />
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Direct Translation", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title"
        } as Track;
        const testingTask = {
            type: "TASK_DIRECT_TRANSLATE",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Direct Translation <span> to <b>Italian</b></span> <i /></div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                    <div />
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Caption Review", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
        } as Track;
        const testingTask = {
            type: "TASK_REVIEW",
            trackReviewType: "GENERAL",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Review of <b>English (US)</b> Caption <i /></div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                    <div />
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Caption Post-Editing Review", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
        } as Track;
        const testingTask = {
            type: "TASK_REVIEW",
            trackReviewType: "POST_EDITING",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Post-Editing Review of <b>English (US)</b> Caption <i /></div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                    <div />
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Translation Review", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
        } as Track;
        const testingTask = {
            type: "TASK_REVIEW",
            trackReviewType: "GENERAL",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Review of <span><b>English (US)</b> to <b>Italian</b></span> Translation <i /></div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                    <div />
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Translation Post-Editing Review", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
        } as Track;
        const testingTask = {
            type: "TASK_REVIEW",
            trackReviewType: "POST_EDITING",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>
                        Post-Editing Review of <span><b>English (US)</b> to <b>Italian</b></span> Translation <i />
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                    <div />
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders without data loaded", () => {
        // GIVEN
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b /> <i /></div>
                    <div />
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div />
                    <div />
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders without Task", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
        } as Track;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i /></div>
                    <div />
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div />
                    <div />
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Progress with cues", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 20, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(20, 60, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 120000,
            progress: 50
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Caption in: <b>English (US)</b> <span><i>2 minutes</i></span></div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                    <div>Completed: <b>50%</b></div>
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Progress with cues and video length 0", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 20, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(20, 60, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 0,
            progress: 0
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Caption in: <b>English (US)</b> <i /></div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                    <div>Completed: <b>0%</b></div>
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Progress with empty cues", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 120000,
            progress: 0
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Caption in: <b>English (US)</b> <span><i>2 minutes</i></span></div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                    <div>Completed: <b>0%</b></div>
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders video duration more than an hour", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 3730000,
            progress: 0
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Caption in: <b>English (US)</b> <span><i>1 hour 2 minutes 10 seconds</i></span></div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                    <div>Completed: <b>0%</b></div>
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders video duration rounded", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 123456,
            progress: 0
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Caption in: <b>English (US)</b> <span><i>2 minutes 3 seconds</i></span></div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                    <div>Completed: <b>0%</b></div>
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Media Chunk range if present", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 125000,
            mediaChunkStart: 10000,
            mediaChunkEnd: 110000,
            progress: 0
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Caption in: <b>English (US)</b> <span><i>2 minutes 5 seconds</i>
                        <b>
                            <span> (Media Chunk Range </span>
                            <span>00:00:10</span>
                            <span> to </span>
                            <span>00:01:50)</span>
                        </b>
                    </span>{/* eslint-disable-line react/jsx-closing-tag-location */}
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                    <div>Completed: <b>0%</b></div>
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Final Review Media Chunk if present", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 125000,
            mediaChunkStart: 10000,
            mediaChunkEnd: 110000,
            progress: 0
        } as Track;
        const testingTask = {
            type: "TASK_REVIEW",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false,
            finalChunkReview: true
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Final Chunk Review of <b>English (US)</b> Caption <span><i>2 minutes 5 seconds</i>
                        <b>
                            <span> (Media Chunk Range </span>
                            <span>00:00:10</span>
                            <span> to </span>
                            <span>00:01:50)</span>
                        </b>
                    </span>{/* eslint-disable-line react/jsx-closing-tag-location */}
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                    <div>Completed: <b>0%</b></div>
                </div>
            </header>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });
});
