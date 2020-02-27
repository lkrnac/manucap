import "../testUtils/initBrowserEnvironment";
import { CueDto, Language, Task, Track } from "./model";
import { removeDraftJsDynamicValues, removeVideoPlayerDynamicValue } from "../testUtils/testUtils";
import { updateEditingTrack, updateTask } from "./trackSlices";
import CueLine from "./cues/CueLine";
import { Provider } from "react-redux";
import React from "react";
import SubtitleEdit from "./SubtitleEdit";
import { SubtitleSpecification } from "./toolbox/model";
import Toolbox from "./toolbox/Toolbox";
import VideoPlayer from "./player/VideoPlayer";
import { mount } from "enzyme";
import { readSubtitleSpecification } from "./toolbox/subtitleSpecificationSlice";
import testingStore from "../testUtils/testingStore";
import { updateCues } from "./cues/cueSlices";

const cues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];
const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
} as Track;
const testingTask = {
    type: "TASK_CAPTION",
    projectName: "Project One",
    dueDate: "2019/12/30 10:00AM"
} as Task;

describe("SubtitleEdit", () => {
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
                            <div>Caption in: <b>English (US)</b> <i /></div>
                        </div>
                        <div style={{ flex: "2" }} />
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                            <div />
                        </div>
                    </header>
                    <div style={{ display: "flex", alignItems: "flex-start", height: "93%" }}>
                        <div style={{ flex: "1 1 40%", display: "flex", flexFlow: "column", paddingRight: "10px" }}>
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
                            <div style={{ overflowY: "scroll", height: "100%" }}>
                                <CueLine index={0} cue={cues[0]} playerTime={0} />
                                <CueLine index={1} cue={cues[1]} playerTime={0} />
                            </div>
                            <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end" }}>
                                <button className="btn btn-primary sbte-view-all-tracks-btn" type="button">
                                    View All Tracks
                                </button>
                                <span style={{ flexGrow: 2 }} />
                                <button
                                    className="btn btn-primary sbte-save-subtitle-btn"
                                    type="button"
                                    style={{ marginRight: "10px" }}
                                >
                                    Save
                                </button>
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
                    onViewAllTracks={(): void => {/*dummy*/}}
                    onSave={(): void => {/*dummy*/}}
                    onComplete={(): void => {/*dummy*/}}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateTask(testingTask));
        testingStore.dispatch(readSubtitleSpecification({ enabled: false } as SubtitleSpecification));
        testingStore.dispatch(updateCues(cues));

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
                    onSave={(): void => {/*dummy*/}}
                    onComplete={(): void => {/*dummy*/}}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateTask(testingTask));
        testingStore.dispatch(readSubtitleSpecification({ enabled: false } as SubtitleSpecification));
        testingStore.dispatch(updateCues(cues));

        // WHEN
        actualNode.find("button.sbte-view-all-tracks-btn").simulate("click");

        // THEN
        expect(mockOnViewAllTracks.mock.calls.length).toBe(1);
    });

    it("calls onSave callback when button is clicked", () => {
        // GIVEN
        const mockOnSave = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => {/*dummy*/}}
                    onSave={mockOnSave}
                    onComplete={(): void => {/*dummy*/}}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateTask(testingTask));
        testingStore.dispatch(readSubtitleSpecification({ enabled: false } as SubtitleSpecification));
        testingStore.dispatch(updateCues(cues));

        // WHEN
        actualNode.find("button.sbte-save-subtitle-btn").simulate("click");

        // THEN
        expect(mockOnSave.mock.calls.length).toBe(1);
    });

    it("calls onComplete callback when button is clicked", () => {
        // GIVEN
        const mockOnComplete = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewAllTracks={(): void => {/*dummy*/}}
                    onSave={(): void => {/*dummy*/}}
                    onComplete={mockOnComplete}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateTask(testingTask));
        testingStore.dispatch(readSubtitleSpecification({ enabled: false } as SubtitleSpecification));
        testingStore.dispatch(updateCues(cues));

        // WHEN
        actualNode.find("button.sbte-complete-subtitle-btn").simulate("click");

        // THEN
        expect(mockOnComplete.mock.calls.length).toBe(1);
    });
});
