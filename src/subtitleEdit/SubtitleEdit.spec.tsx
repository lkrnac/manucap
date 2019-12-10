import "../initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import VideoPlayer from "../player/VideoPlayer";
import SubtitleEdit from "./SubtitleEdit";
import {removeVideoPlayerDynamicValue} from "../testUtils";

describe("SubtitleEdit", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = enzyme.mount(
            <div style={{ display: "flex", height: "100%" }}>
                <div style={{ flex: "1 1 0", padding: "10px" }}>
                    <VideoPlayer
                        mp4="dummyMp4"
                        poster="dummyPoster"
                        tracks={[]}
                    />
                </div>
                <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column", padding: "10px" }}>
                    <input inputMode="text"/>
                    <input inputMode="text"/>
                </div>
            </div>
        );

        // WHEN
        const actualNode = enzyme.mount(<SubtitleEdit mp4="dummyMp4" poster="dummyPoster" />);

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });
});
