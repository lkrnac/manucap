import "../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { Language, Task, Track, TrackVersion } from "../player/model";
import { updateEditingTrack, updateTask } from "../player/trackSlices";
import { Provider } from "react-redux";
import React from "react";
import SubtitleEditHeader from "./SubtitleEditHeader";
import { createTestingStore } from "../testUtils/testingStore";
import { mount } from "enzyme";
import { removeVideoPlayerDynamicValue } from "../testUtils/testUtils";

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
            videoTitle: "This is the video title",
            videoLength: 125
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Caption in: <b>English (US)</b> <i>2 minutes 5 seconds</i></div>
                </div>
                <div style={{ flex: "2" }} />
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
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateTask(testingTask));

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
            videoTitle: "This is the video title",
            sourceTrack: {
                type: "CAPTION",
                language: { id: "en-US", name: "English (US)" } as Language,
                default: true,
                videoTitle: "This is the video title",
            } as Track
        } as Track;
        const testingTask = {
            type: "TASK_TRANSLATE",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Translation from <span><b>English (US)</b> to <b>Italian</b></span> <i /></div>
                </div>
                <div style={{ flex: "2" }} />
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
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateTask(testingTask));

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
            videoTitle: "This is the video title"
        } as Track;
        const testingTask = {
            type: "TASK_DIRECT_TRANSLATE",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Direct Translation <span> to <b>Italian</b></span> <i /></div>
                </div>
                <div style={{ flex: "2" }} />
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
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateTask(testingTask));

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
            videoTitle: "This is the video title",
        } as Track;
        const testingTask = {
            type: "TASK_REVIEW",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Review of <b>English (US)</b> Caption <i /></div>
                </div>
                <div style={{ flex: "2" }} />
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
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateTask(testingTask));

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
            videoTitle: "This is the video title",
            sourceTrack: {
                type: "CAPTION",
                language: { id: "en-US", name: "English (US)" } as Language,
                default: true,
                videoTitle: "This is the video title",
            } as Track
        } as Track;
        const testingTask = {
            type: "TASK_REVIEW",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Review of <span><b>English (US)</b> to <b>Italian</b></span> Translation <i /></div>
                </div>
                <div style={{ flex: "2" }} />
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
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateTask(testingTask));

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
            videoTitle: "This is the video title",
        } as Track;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div><b>This is the video title</b> <i /></div>
                    <div />
                </div>
                <div style={{ flex: "2" }} />
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
        testingStore.dispatch(updateEditingTrack(testingTrack));

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Progress with cues", () => {
        // GIVEN
        const cues = [
            new VTTCue(0, 20, "Caption Line 1"),
            new VTTCue(20, 60, "Caption Line 2"),
        ];
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            videoTitle: "This is the video title",
            videoLength: 120,
            currentVersion: { cues } as TrackVersion
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Caption in: <b>English (US)</b> <i>2 minutes</i></div>
                </div>
                <div style={{ flex: "2" }} />
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
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateTask(testingTask));

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Progress with cues and video length 0", () => {
        // GIVEN
        const cues = [
            new VTTCue(0, 20, "Caption Line 1"),
            new VTTCue(20, 60, "Caption Line 2"),
        ];
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            videoTitle: "This is the video title",
            videoLength: 0,
            currentVersion: { cues } as TrackVersion
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Caption in: <b>English (US)</b> <i /></div>
                </div>
                <div style={{ flex: "2" }} />
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
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateTask(testingTask));

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
            videoTitle: "This is the video title",
            videoLength: 120,
            currentVersion: { cues: []} as TrackVersion
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Caption in: <b>English (US)</b> <i>2 minutes</i></div>
                </div>
                <div style={{ flex: "2" }} />
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
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateTask(testingTask));

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
            videoTitle: "This is the video title",
            videoLength: 3730,
            currentVersion: { cues: []} as TrackVersion
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Caption in: <b>English (US)</b> <i>1 hour 2 minutes 10 seconds</i></div>
                </div>
                <div style={{ flex: "2" }} />
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
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateTask(testingTask));

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });
});
