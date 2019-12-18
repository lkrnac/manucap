import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import {removeVideoPlayerDynamicValue} from "../testUtils/testUtils";
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";
import {Language, Track, TrackDescription, TrackProgress} from "../player/model";
import {updateEditingTrack} from "../player/trackSlices";
import SubtitleEditHeader from "./SubtitleEditHeader";

describe("SubtitleEditHeader", () => {
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
        } as Track;
        const expectedNode = enzyme.mount(
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

        );

        // WHEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore} >
                <SubtitleEditHeader />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack));

        // THEN
        expect(removeVideoPlayerDynamicValue(actualNode.html()))
            .toEqual(removeVideoPlayerDynamicValue(expectedNode.html()));
    });
});
