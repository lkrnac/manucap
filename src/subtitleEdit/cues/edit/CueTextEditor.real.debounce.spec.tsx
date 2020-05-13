import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import React from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import { mount, ReactWrapper } from "enzyme";

import { createTestingStore } from "../../../testUtils/testingStore";
import { reset } from "./editorStatesSlice";
import { CueDto } from "../../model";
import { updateCues } from "../cueSlices";
import CueTextEditor from "./CueTextEditor";

let testingStore = createTestingStore();

const cues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

const createEditorNode = (text = "someText"): ReactWrapper => {
    const vttCue = new VTTCue(0, 1, text);
    const actualNode = mount(
        <Provider store={testingStore}>
            <CueTextEditor index={0} vttCue={vttCue} />
        </Provider>
    );
    return actualNode.find(".public-DraftEditor-content");
};

describe("CueTextEditor", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(reset() as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
    });

    it("updates cue in redux store with debounce", (done) => {
        // GIVEN
        const editor = createEditorNode();

        // WHEN
        editor.simulate("paste", {
            clipboardData: {
                types: ["text/plain"],
                getData: (): string => " Paste text to end",
            }
        });

        // THEN
        setTimeout(
            () => {
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("someText Paste text to end");
                done();
            },
            150
        );
    });

    it("doesn't update cue in redux immediately after change", () => {
        // GIVEN
        const editor = createEditorNode();

        // WHEN
        editor.simulate("paste", {
            clipboardData: {
                types: ["text/plain"],
                getData: (): string => " Paste text to end",
            }
        });

        // THEN
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1");
    });
});
