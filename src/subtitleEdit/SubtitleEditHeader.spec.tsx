import "../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { CueDto, Language, Task, Track } from "./model";
import { updateEditingTrack, updateTask } from "./trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import SubtitleEditHeader from "./SubtitleEditHeader";
import { createTestingStore } from "../testUtils/testingStore";
import { mount } from "enzyme";
import { removeVideoPlayerDynamicValue } from "../testUtils/testUtils";
import { updateCues } from "./cues/cuesList/cuesListActions";
import { updateSourceCues } from "./cues/view/sourceCueSlices";

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
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Caption in:{" "}
                        <span className="font-medium text-blue-light ml-1">English (US)</span>{" "}
                        <span><i>2 minutes 5 seconds</i></span>
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-check text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Completed:</span>
                        </span>
                        <span>0%</span>
                    </div>
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
        const testingCues = [
            { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 4, "Caption Text Number 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(4, 6, "Caption 3"), cueCategory: "DIALOGUE" }
        ] as CueDto[];
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
            mediaLength: 120000
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
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Translation from{" "}
                        <span className="inline-flex items-center space-x-2 ml-1 font-medium text-blue-light">
                            <span>English (US)</span>
                            <i className="fa-duotone fa-arrow-right-arrow-left" />
                            <span>Italian</span>
                        </span>{" "}
                        <span><i>2 minutes, 9 words</i></span>
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
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
        testingStore.dispatch(updateSourceCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Pivot Translation", () => {
        // GIVEN
        const testingCues = [{ vttCue: new VTTCue(0, 2, "Test Line 4 words"), cueCategory: "DIALOGUE" }] as CueDto[];
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
            mediaLength: 150000
        } as Track;
        const testingTask = {
            type: "TASK_PIVOT_TRANSLATE",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Translation from{" "}
                        <span className="inline-flex items-center space-x-2 ml-1 font-medium text-blue-light">
                            <span>English (US)</span>
                            <i className="fa-duotone fa-arrow-right-arrow-left" />
                            <span>Italian</span>
                        </span>{" "}
                        <span><i>2 minutes 30 seconds, 4 words</i></span>
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
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
        testingStore.dispatch(updateSourceCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Direct Translation", () => {
        // GIVEN
        const testingCues = [{ vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" }] as CueDto[];
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 180000
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
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Direct Translation{" "}
                        <span className="inline-flex items-center space-x-2 ml-1 font-medium text-blue-light">
                            <span>Italian</span>
                        </span>{" "}
                        <span><i>3 minutes</i></span>
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
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
        testingStore.dispatch(updateSourceCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Direct Translation no source cue", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 180000
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
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Direct Translation{" "}
                        <span className="inline-flex items-center space-x-2 ml-1 font-medium text-blue-light">
                            <span>Italian</span>
                        </span>{" "}
                        <span><i>3 minutes</i></span>
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
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
        testingStore.dispatch(updateSourceCues([]) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Translation Review", () => {
        // GIVEN
        const testingCues = [{ vttCue: new VTTCue(0, 2, "Test Line 4 words"), cueCategory: "DIALOGUE" }] as CueDto[];
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
            mediaLength: 150000
        } as Track;
        const testingTask = {
            type: "TASK_REVIEW",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Review of{" "}
                        <span className="inline-flex items-center space-x-2 ml-1 font-medium text-blue-light">
                            <span>English (US)</span>
                            <i className="fa-duotone fa-arrow-right-arrow-left" />
                            <span>Italian</span>
                        </span>
                        {" "}Translation{" "}
                        <span><i>2 minutes 30 seconds, 4 words</i></span>
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
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
        testingStore.dispatch(updateSourceCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });

    it("renders Direct Translation Review", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
            mediaLength: 150000
        } as Track;
        const testingTask = {
            type: "TASK_REVIEW",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Review of{" "}
                        <span className="inline-flex items-center space-x-2 ml-1 font-medium text-blue-light">
                            <span>English (US)</span>
                            <i className="fa-duotone fa-arrow-right-arrow-left" />
                            <span>Italian</span>
                        </span>
                        {" "}Translation{" "}
                        <span><i>2 minutes 30 seconds</i></span>
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
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
        testingStore.dispatch(updateSourceCues([]) as {} as AnyAction);
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
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Review of{" "}
                        <span className="font-medium text-blue-light ml-1">
                            English (US)
                        </span>
                        {" "}Caption{" "}
                        <i />
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
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
            type: "TASK_POST_EDITING",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Post-Editing Review of{" "}
                        <span className="font-medium text-blue-light ml-1">English (US)</span>
                        {" "}Caption{" "}
                        <i />
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
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

    it("renders Caption Proofreading Review", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
        } as Track;
        const testingTask = {
            type: "TASK_PROOF_READING",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Proofreading Review of{" "}
                        <span className="font-medium text-blue-light ml-1">
                            English (US)
                        </span>
                        {" "}Caption{" "}
                        <i />
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
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

    it("renders Caption Sign-Off Review", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
        } as Track;
        const testingTask = {
            type: "TASK_SIGN_OFF",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Sign-Off Review of{" "}
                        <span className="font-medium text-blue-light ml-1">
                            English (US)
                        </span>
                        {" "}Caption{" "}
                        <i />
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
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
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Review of{" "}
                        <span className="font-medium text-blue-light ml-1">
                            English (US)
                        </span>
                        {" "}Caption{" "}
                        <i />
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
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
            type: "TASK_POST_EDITING",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Post-Editing Review of{" "}
                        <span className="inline-flex items-center space-x-2 ml-1 font-medium text-blue-light">
                            <span>English (US)</span>
                            <i className="fa-duotone fa-arrow-right-arrow-left" />
                            <span>Italian</span>
                        </span>
                        {" "}Translation{" "}
                        <i />
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
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

    it("renders Translation Proofreading Review", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
        } as Track;
        const testingTask = {
            type: "TASK_PROOF_READING",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Proofreading Review of{" "}
                        <span className="inline-flex items-center space-x-2 ml-1 font-medium text-blue-light">
                            <span>English (US)</span>
                            <i className="fa-duotone fa-arrow-right-arrow-left" />
                            <span>Italian</span>
                        </span>
                        {" "}Translation{" "}
                        <i />
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
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

    it("renders Translation Sign-Off Review", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
        } as Track;
        const testingTask = {
            type: "TASK_SIGN_OFF",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            editDisabled: false
        } as Task;
        const expectedNode = mount(
            <header style={{ display: "flex", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Sign-Off Review of{" "}
                        <span className="inline-flex items-center space-x-2 ml-1 font-medium text-blue-light">
                            <span>English (US)</span>
                            <i className="fa-duotone fa-arrow-right-arrow-left" />
                            <span>Italian</span>
                        </span>
                        {" "}Translation{" "}
                        <i />
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
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
            <header style={{ display: "flex", paddingBottom: 10 }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span />
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span />
                        </div>
                    </div>
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
            <header style={{ display: "flex", paddingBottom: 10 }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span />
                        </div>
                    </div>
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
            <header style={{ display: "flex", paddingBottom: 10 }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span><i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Caption in:{" "}
                        <span className="font-medium text-blue-light ml-1">
                            English (US)
                        </span>{" "}
                        <span><i>2 minutes</i></span>
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-check text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Completed:</span>
                        </span>
                        <span>50%</span>
                    </div>
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
            <header style={{ display: "flex", paddingBottom: 10 }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Caption in:{" "}
                        <span className="font-medium text-blue-light ml-1">English (US)</span>{" "}
                        <i />
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-check text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Completed:</span>
                        </span>
                        <span>0%</span>
                    </div>
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
            <header style={{ display: "flex", paddingBottom: 10 }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Caption in:{" "}
                        <span className="font-medium text-blue-light ml-1">English (US)</span>
                        {" "}
                        <span><i>2 minutes</i></span>
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-check text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Completed:</span>
                        </span>
                        <span>0%</span>
                    </div>
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
            <header style={{ display: "flex", paddingBottom: 10 }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Caption in:{" "}
                        <span className="font-medium text-blue-light ml-1">English (US)</span>
                        {" "}
                        <span>
                            <i>1 hour 2 minutes 10 seconds</i>
                        </span>
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-check text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Completed:</span>
                        </span>
                        <span>0%</span>
                    </div>
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
            <header style={{ display: "flex", paddingBottom: 10 }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        Caption in:{" "}
                        <span className="font-medium text-blue-light ml-1">English (US)</span>
                        {" "}
                        <span>
                            <i>2 minutes 3 seconds</i>
                        </span>
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-check text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Completed:</span>
                        </span>
                        <span>0%</span>
                    </div>
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
            <header style={{ display: "flex", paddingBottom: 10 }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">Caption in:{" "}
                        <span className="font-medium text-blue-light ml-1">English (US)</span>
                        {" "}
                        <span>
                            <i>2 minutes 5 seconds</i>
                            <span>
                                <span> (Media Chunk Range </span>
                                <span>00:00:10</span>
                                <span> to </span>
                                <span>00:01:50)</span>
                            </span>
                        </span>
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-check text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Completed:</span>
                        </span>
                        <span>0%</span>
                    </div>
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
            <header style={{ display: "flex", paddingBottom: 10 }}>
                <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                    <div className="space-x-2 flex items-center">
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-video text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Video:</span>
                            </span>
                            <span>This is the video title</span>
                        </div>
                        <div className="space-x-1">
                            <span>
                                <i className="vtms-icon fa-duotone fa-archive text-sm text-blue-light w-5" />
                                <span className="font-medium text-blue-light">Project:</span>
                            </span>
                            <span>Project One</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">Final Chunk Review of{" "}
                        <span className="font-medium text-blue-light ml-1">English (US)</span>
                        {" "}Caption{" "}
                        <span>
                            <i>2 minutes 5 seconds</i>
                            <span>
                                <span> (Media Chunk Range </span>
                                <span>00:00:10</span>
                                <span> to </span>
                                <span>00:01:50)</span>
                            </span>
                        </span>
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "column" }}>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-calendar text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Due Date:</span>
                        </span>
                        <span>2019/12/30 10:00AM</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>
                            <i className="vtms-icon fa-duotone fa-check text-sm text-blue-light w-5" />
                            <span className="font-medium text-blue-light">Completed:</span>
                        </span>
                        <span>0%</span>
                    </div>
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
