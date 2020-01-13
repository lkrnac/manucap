import "../testUtils/initBrowserEnvironment";
import { Language, Task, Track, TrackVersion } from "../player/model";
import { removeDraftJsDynamicValues, removeVideoPlayerDynamicValue } from "../testUtils/testUtils";
import { updateEditingTrack, updateTask } from "../player/trackSlices";
import CueTextEditor from "./CueTextEditor";
import { Provider } from "react-redux";
import React from "react";
import SubtitleEdit from "./SubtitleEdit";
import { SubtitleSpecification } from "../toolbox/model";
import Toolbox from "../toolbox/Toolbox";
import VideoPlayer from "../player/VideoPlayer";
import { mount } from "enzyme";
import { readSubtitleSpecification } from "../toolbox/subtitleSpecificationSlice";
import testingStore from "../testUtils/testingStore";

describe("SubtitleEdit", () => {
    it("renders", () => {
        // GIVEN
        const cues = [
            new VTTCue(0, 1, "Caption Line 1"),
            new VTTCue(1, 2, "Caption Line 2"),
        ];
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            videoTitle: "This is the video title",
            currentVersion: { cues } as TrackVersion
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const expectedNode = mount(
            <Provider store={testingStore} >
                <div className="sbte-subtitle-edit" style={{ display: "flex", flexFlow: "column", padding: "10px" }}>
                    <header style={{ display: "flex", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div><b>This is the video title</b> <i>Project One</i></div>
                            <div>Caption in: <b>English (US)</b></div>
                        </div>
                        <div style={{ flex: "2" }} />
                        <div style={{ display: "flex", flexFlow: "column" }}>
                            <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                            <div />
                        </div>
                    </header>
                    <div style={{ display: "flex", height: "100%" }}>
                        <div style={{ flex: "1 1 0", display: "flex", flexFlow: "column", paddingRight: "10px" }}>
                            <VideoPlayer
                                mp4="dummyMp4"
                                poster="dummyPoster"
                                tracks={[testingTrack]}
                            />
                            <Toolbox />
                        </div>
                        <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column", paddingLeft: "10px" }}>
                            <CueTextEditor index={0} cue={cues[0]} />
                            <CueTextEditor index={1} cue={cues[1]} />
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <SubtitleEdit mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack));
        testingStore.dispatch(updateTask(testingTask));
        testingStore.dispatch(readSubtitleSpecification({ enabled: false } as SubtitleSpecification));

        // THEN
        expect(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(actualNode.html())))
            .toEqual(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(expectedNode.html())));
    });
});
