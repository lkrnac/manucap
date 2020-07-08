import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import React from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import { mount, ReactWrapper } from "enzyme";

import { createTestingStore } from "../../../testUtils/testingStore";
import { reset } from "./editorStatesSlice";
import { CueDto, Track } from "../../model";
import { updateCues } from "../cueSlices";
import CueTextEditor from "./CueTextEditor";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";

let testingStore = createTestingStore();

const cues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

const createEditorNode = (text = "someText"): ReactWrapper => {
    const vttCue = new VTTCue(0, 1, text);
    const editUuid = testingStore.getState().cues[0].editUuid;
    const actualNode = mount(
        <Provider store={testingStore}>
            <CueTextEditor index={0} vttCue={vttCue} editUuid={editUuid} />
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
            250
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

    it("update cue in redux when unmounted, before debounce timeout", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        const editUuid = testingStore.getState().cues[0].editUuid;
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor index={0} vttCue={vttCue} editUuid={editUuid} />
            </Provider>
        );
        const editor = actualNode.find(".public-DraftEditor-content");
        editor.simulate("paste", {
            clipboardData: {
                types: ["text/plain"],
                getData: (): string => " Paste text to end",
            }
        });

        // WHEN
        actualNode.unmount();

        // THEN
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("someText Paste text to end");
    });

    it("cancel save debounce when unmounted", (done) => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);
        const vttCue = new VTTCue(0, 1, "someText");
        const editUuid = testingStore.getState().cues[0].editUuid;
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor index={0} vttCue={vttCue} editUuid={editUuid} />
            </Provider>
        );
        const editor = actualNode.find(".public-DraftEditor-content");
        editor.simulate("paste", {
            clipboardData: {
                types: ["text/plain"],
                getData: (): string => " Paste text to end",
            }
        });

        // WHEN
        actualNode.unmount();

        // THEN
        setTimeout(
            () => {
                expect(saveTrack).not.toBeCalled();
                done();
            },
            3000
        );
    });
});
