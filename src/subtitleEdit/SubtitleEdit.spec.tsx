import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import VideoPlayer from "../player/VideoPlayer";
import SubtitleEdit from "./SubtitleEdit";
import {removeVideoPlayerDynamicValue} from "../testUtils/testUtils";
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";
import {Language, Track, TrackDescription, TrackProgress, TrackVersion} from "../player/model";
import {updateEditingTrack} from "../player/trackSlices";

describe("SubtitleEdit", () => {
    it("renders", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: {id: "en-US"} as Language,
            default: true,
            videoTitle: "This is the video title",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM",
            description: {action: "Caption in", subject: "English (US)"} as TrackDescription,
            progress: {unit: "115/115 seconds", percentage: "100"} as TrackProgress,
            currentVersion: {
                cues: [
                    new VTTCue(0, 1, "Caption Line 1"),
                    new VTTCue(1, 2, "Caption Line 2"),
                ]
            } as TrackVersion
        } as Track;
        const expectedNode = enzyme.mount(
            <div style={{display: "flex", flexFlow: "column"}}>
                <header style={{display: "flex"}}>
                    <div style={{display: "flex", flexFlow: "column"}}>
                        <div><b>This is the video title</b> <i>Project One</i></div>
                        <div>Caption in <b>English (US)</b></div>
                    </div>
                    <div style={{flex: "2"}}/>
                    <div style={{display: "flex", flexFlow: "column"}}>
                        <div>Due Date: <b>2019/12/30 10:00AM</b></div>
                        <div>Completed: 115/115 seconds <b>[100%]</b></div>
                    </div>
                </header>
                <div style={{display: "flex", height: "100%"}}>
                    <div style={{flex: "1 1 0", padding: "10px"}}>
                        <VideoPlayer
                            mp4="dummyMp4"
                            poster="dummyPoster"
                            tracks={[testingTrack]}
                        />
                    </div>
                    <div style={{flex: "1 1 0", display: "flex", flexDirection: "column", padding: "10px"}}>
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore} >
                <SubtitleEdit mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack));

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });
});
