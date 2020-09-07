/**  * @jest-environment jsdom-sixteen  */
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
import { setSpellCheckDomain } from "../spellCheck/spellCheckSlices";
import { fireEvent, render } from "@testing-library/react";

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

jest.setTimeout(8000);

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

    it("doesn't update cue in redux when unmounted if no change to text", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        const editUuid = testingStore.getState().cues[0].editUuid;
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor index={0} vttCue={vttCue} editUuid={editUuid} />
            </Provider>
        );

        // WHEN
        actualNode.unmount();

        // THEN
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("someText");
    });

    it("triggers autosave only once immediately after text change", (done) => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);
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
                expect(saveTrack).toBeCalledTimes(1);
                done();
            },
            6000
        );
    });

    it("triggers spellcheck only once immediately after text change", (done) => {
        // GIVEN
        const testingResponse = {
            matches: [
                {
                    message: "This sentence does not start with an uppercase letter",
                    replacements: [{ "value": "Txt" }],
                    "offset": 0,
                    "length": 3,
                },
                {
                    "message": "Possible spelling mistake found.",
                    "replacements": [
                        { value: "check" },
                        { value: "Chuck" },
                        { value: "chick" },
                        { value: "chuck" },
                        { value: "chock" },
                        { value: "CCK" },
                        { value: "CHC" },
                        { value: "CHK" },
                        { value: "cock" },
                        { value: "ch ck" }
                    ],
                    "offset": 7,
                    "length": 4,
                }
            ]
        };

        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(
            { language: { id: "testing-language" }} as Track
        ) as {} as AnyAction);

        // @ts-ignore modern browsers does have it
        global.fetch = jest.fn()
            .mockImplementationOnce(() => new Promise((resolve) => resolve({ json: () => testingResponse })));

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
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledWith(
                    "https://testing-domain/v2/check",
                    { method: "POST", body: "language=testing-language&text=someText Paste text to end" }
                );
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledTimes(1);
                done();
            },
            6000
        );
    });

    it("triggers spellcheck only once immediately after clear text change", (done) => {
        // GIVEN
        const testingResponse = {
            matches: [
                {
                    message: "This sentence does not start with an uppercase letter",
                    replacements: [{ "value": "Txt" }],
                    "offset": 0,
                    "length": 3,
                },
                {
                    "message": "Possible spelling mistake found.",
                    "replacements": [
                        { value: "check" },
                        { value: "Chuck" },
                        { value: "chick" },
                        { value: "chuck" },
                        { value: "chock" },
                        { value: "CCK" },
                        { value: "CHC" },
                        { value: "CHK" },
                        { value: "cock" },
                        { value: "ch ck" }
                    ],
                    "offset": 7,
                    "length": 4,
                }
            ]
        };

        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(
            { language: { id: "testing-language" }} as Track
        ) as {} as AnyAction);

        // @ts-ignore modern browsers does have it
        global.fetch = jest.fn()
            .mockImplementation(() => new Promise((resolve) => resolve({ json: () => testingResponse })));

        const vttCue = new VTTCue(0, 1, "test to clear");
        const editUuid = testingStore.getState().cues[0].editUuid;
        const { container } = render(
            <Provider store={testingStore}>
                <CueTextEditor index={0} vttCue={vttCue} editUuid={editUuid} />
            </Provider>
        );
        const editor = container.querySelector(".public-DraftEditor-content") as Element;

        // WHEN
        fireEvent.keyDown(editor, { keyCode: 8 });

        // THEN
        setTimeout(
            () => {
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledWith(
                    "https://testing-domain/v2/check",
                    { method: "POST", body: "language=testing-language&text=test to clea" }
                );
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledTimes(1);
                done();
            },
            6000
        );
    });

    it("doesn't trigger autosave when cue editor is rendered", (done) => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);

        // WHEN
        createEditorNode();

        // THEN
        setTimeout(
            () => {
                expect(saveTrack).not.toBeCalled();
                done();
            },
            2600
        );
    });
});
