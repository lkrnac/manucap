import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import VideoPlayer from "../player/VideoPlayer";
import SubtitleEdit from "./SubtitleEdit";
import {removeVideoPlayerDynamicValue} from "../testUtils/testUtils";
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";
import {Language, Track, TrackVersion} from "../player/model";
import {updateEditingTrack} from "../player/trackSlices";

describe("SubtitleEdit", () => {
    it("renders", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: {id: "en-US"} as Language,
            default: true,
            currentVersion: {
                cues: [
                    new VTTCue(0, 1, "Caption Line 1"),
                    new VTTCue(1, 2, "Caption Line 2"),
                ]
            } as TrackVersion
        } as Track;
        const expectedNode = enzyme.mount(
            <div style={{ display: "flex", height: "100%" }}>
                <div style={{ flex: "1 1 0", padding: "10px" }}>
                    <VideoPlayer
                        mp4="dummyMp4"
                        poster="dummyPoster"
                        tracks={[testingTrack]}
                    />
                </div>
                <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column", padding: "10px" }}>
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
