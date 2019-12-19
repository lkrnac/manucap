import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import VideoPlayer from "../player/VideoPlayer";
import SubtitleEdit from "./SubtitleEdit";
import {removeDraftJsDynamicValues, removeVideoPlayerDynamicValue} from "../testUtils/testUtils";
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";
import {Language, Track, TrackVersion} from "../player/model";
import {updateEditingTrack} from "../player/trackSlices";
import CueTextEditor from "./CueTextEditor";

describe("SubtitleEdit", () => {
    it("renders", () => {
        // GIVEN
        const cues = [
            new VTTCue(0, 1, "Caption Line 1"),
            new VTTCue(1, 2, "Caption Line 2"),
        ];
        const testingTrack = {
            type: "CAPTION",
            language: {id: "en-US"} as Language,
            default: true,
            currentVersion: {cues} as TrackVersion
        } as Track;
        const expectedNode = enzyme.mount(
            <Provider store={testingStore} >
                <div style={{ display: "flex", height: "100%" }}>
                    <div style={{ flex: "1 1 0", padding: "10px" }}>
                        <VideoPlayer
                            mp4="dummyMp4"
                            poster="dummyPoster"
                            tracks={[testingTrack]}
                        />
                    </div>
                    <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column", padding: "10px" }}>
                        <CueTextEditor index={0} cue={cues[0]}/>
                        <CueTextEditor index={1} cue={cues[1]}/>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore} >
                <SubtitleEdit mp4="dummyMp4" poster="dummyPoster" />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack));

        // THEN
        expect(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(actualNode.html())))
            .toEqual(removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(expectedNode.html())));
    });
});
