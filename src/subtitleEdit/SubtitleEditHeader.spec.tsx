import "../testUtils/initBrowserEnvironment";
import {Language, Task, Track} from "../player/model";
import {updateEditingTrack, updateTask} from "../player/trackSlices";
import {Provider} from "react-redux";
import React from "react";
import SubtitleEditHeader from "./SubtitleEditHeader";
import {mount} from "enzyme";
import {removeVideoPlayerDynamicValue} from "../testUtils/testUtils";
import testingStore from "../testUtils/testingStore";

describe("SubtitleEditHeader", () => {
    it("renders Caption", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: {id: "en-US", name: "English (US)"} as Language,
            default: true,
            videoTitle: "This is the video title",
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const expectedNode = mount(
            <header style={{display: "flex", paddingBottom: "10px"}}>
                <div style={{display: "flex", flexFlow: "column"}}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Caption in: <b>English (US)</b></div>
                </div>
                <div style={{flex: "2"}}/>
                <div style={{display: "flex", flexFlow: "column"}}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
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
            language: {id: "it-IT", name: "Italian"} as Language,
            default: true,
            videoTitle: "This is the video title",
            sourceTrack: {
                type: "CAPTION",
                language: {id: "en-US", name: "English (US)"} as Language,
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
            <header style={{display: "flex", paddingBottom: "10px"}}>
                <div style={{display: "flex", flexFlow: "column"}}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Translation from <span><b>English (US)</b> to <b>Italian</b></span></div>
                </div>
                <div style={{flex: "2"}}/>
                <div style={{display: "flex", flexFlow: "column"}}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
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
            language: {id: "it-IT", name: "Italian"} as Language,
            default: true,
            videoTitle: "This is the video title"
        } as Track;
        const testingTask = {
            type: "TASK_DIRECT_TRANSLATE",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const expectedNode = mount(
            <header style={{display: "flex", paddingBottom: "10px"}}>
                <div style={{display: "flex", flexFlow: "column"}}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Direct Translation <span> to <b>Italian</b></span></div>
                </div>
                <div style={{flex: "2"}}/>
                <div style={{display: "flex", flexFlow: "column"}}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
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
            language: {id: "en-US", name: "English (US)"} as Language,
            default: true,
            videoTitle: "This is the video title",
        } as Track;
        const testingTask = {
            type: "TASK_REVIEW",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const expectedNode = mount(
            <header style={{display: "flex", paddingBottom: "10px"}}>
                <div style={{display: "flex", flexFlow: "column"}}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Review of <b>English (US)</b> Caption</div>
                </div>
                <div style={{flex: "2"}}/>
                <div style={{display: "flex", flexFlow: "column"}}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
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
            language: {id: "it-IT", name: "Italian"} as Language,
            default: true,
            videoTitle: "This is the video title",
            sourceTrack: {
                type: "CAPTION",
                language: {id: "en-US", name: "English (US)"} as Language,
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
            <header style={{display: "flex", paddingBottom: "10px"}}>
                <div style={{display: "flex", flexFlow: "column"}}>
                    <div><b>This is the video title</b> <i>Project One</i></div>
                    <div>Review of <span><b>English (US)</b> to <b>Italian</b></span> Translation</div>
                </div>
                <div style={{flex: "2"}}/>
                <div style={{display: "flex", flexFlow: "column"}}>
                    <div>Due Date: <b>2019/12/30 10:00AM</b></div>
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
            language: {id: "en-US", name: "English (US)"} as Language,
            default: true,
            videoTitle: "This is the video title",
        } as Track;
        const expectedNode = mount(
            <header style={{display: "flex", paddingBottom: "10px"}}>
                <div style={{display: "flex", flexFlow: "column"}}>
                    <div><b>This is the video title</b> <i/></div>
                    <div/>
                </div>
                <div style={{flex: "2"}}/>
                <div style={{display: "flex", flexFlow: "column"}}>
                    <div/>
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
        testingStore.dispatch(updateTask({} as Task));

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });
});
