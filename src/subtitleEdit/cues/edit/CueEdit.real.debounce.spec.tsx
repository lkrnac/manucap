/**  * @jest-environment jsdom-sixteen  */
// TODO Remove above when we update to react-scripts with Jest 26:
// https://github.com/facebook/create-react-app/pull/8362
// eslint-disable-next-line
// https://stackoverflow.com/questions/61036156/react-typescript-testing-typeerror-mutationobserver-is-not-a-constructor#comment110029314_61039444

import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { Provider } from "react-redux";
import React from "react";
import { render } from "@testing-library/react";
import { AnyAction } from "redux";

// @ts-ignore - Doesn't have types definitions file
import { CueDto, CueError, Track } from "../../model";
import CueEdit from "./CueEdit";
import { createTestingStore } from "../../../testUtils/testingStore";
import { updateCues } from "../cuesList/cuesListActions";
import { setValidationErrors } from "./cueEditorSlices";
import { updateEditingTrack } from "../../trackSlices";

let testingStore = createTestingStore();

const cues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

const testTrack = { mediaTitle: "testingTrack", language: { id: "en-US", name: "English", direction: "LTR" }};

describe("CueEdit", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
    });

    it("auto sets validation error to false after receiving it", (done) => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
        const actualNode = render(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cue} playerTime={1} />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);

        // THEN
        setTimeout(() => {
            expect(testingStore.getState().validationErrors).toEqual([]);
            const rootElement = actualNode.container.querySelector("div") as HTMLDivElement;
            expect(rootElement.className).toEqual("sbte-bottom-border bg-white");
            done();
        }, 1100);
    });
});
