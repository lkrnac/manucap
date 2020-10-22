import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
// @ts-ignore - Doesn't have types definitions file
import { CueDto } from "../../model";
import CueEdit from "./CueEdit";
import { Provider } from "react-redux";
import React from "react";
import { createTestingStore } from "../../../testUtils/testingStore";
import { mount } from "enzyme";
import { updateCues } from "../cuesListActions";
import { AnyAction } from "redux";
import { setValidationError } from "./cueEditorSlices";

let testingStore = createTestingStore();

const cues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

describe("CueEdit", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
    });

    it("auto sets validation error to false after receiving it", (done) => {
        // GIVEN
        const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
        const actualNode = mount(
            <Provider store={testingStore} >
                <CueEdit index={0} cue={cue} playerTime={1} />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(setValidationError(true) as {} as AnyAction);

        // THEN
        setTimeout(() => {
            expect(testingStore.getState().validationError).toEqual(false);
            expect(actualNode.find("div").at(0).hasClass("bg-white")).toBeTruthy();
            done();
        }, 1100);
    });
});
