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
import { SearchReplaceMatches } from "../searchReplace/model";
import { updateCues } from "../cuesListActions";
import CueTextEditor from "./CueTextEditor";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { fireEvent, render } from "@testing-library/react";
import { replaceCurrentMatch } from "../searchReplace/searchReplaceSlices";
import { act } from "react-dom/test-utils";
import { setSpellCheckDomain } from "../../spellcheckerSettingsSlice";
import { updateEditingCueIndex } from "./cueEditorSlices";

let testingStore = createTestingStore();

const cues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
];
const bindCueViewModeKeyboardShortcutSpy = jest.fn() as () => void;
const unbindCueViewModeKeyboardShortcutSpy = jest.fn() as () => void;
const ruleId = "MORFOLOGIK_RULE_EN_US";

const createEditorNode = (text = "someText", index?: number): ReactWrapper => {
    const idx = index != null ? index : 0;
    const vttCue = new VTTCue(0, 1, text);
    const cue = testingStore.getState().cues[idx];
    vttCue.text = text;
    const editUuid = cue.editUuid;
    const actualNode = mount(
        <Provider store={testingStore}>
            <CueTextEditor
                bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                index={idx}
                vttCue={vttCue}
                editUuid={editUuid}
            />
        </Provider>
    );
    return actualNode.find(".public-DraftEditor-content");
};

const testTrack = { mediaTitle: "testingTrack", language: { id: "en-US", name: "English", direction: "LTR" }};

jest.setTimeout(8000);

describe("CueTextEditor", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(reset() as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        jest.resetAllMocks();
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
                <CueTextEditor
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                    index={0}
                    vttCue={vttCue}
                    editUuid={editUuid}
                />
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

    it("updates cue in redux for single match/replace when unmounted for next match - single", (done) => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        const searchReplaceMatches = {
            offsets: [10],
            offsetIndex: 0,
            matchLength: 4
        } as SearchReplaceMatches;
        const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b> sample");
        const editUuid = testingStore.getState().cues[0].editUuid;
        const actualNode = render(
            <Provider store={testingStore}>
                <CueTextEditor
                    index={0}
                    vttCue={vttCue}
                    editUuid={editUuid}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                    searchReplaceMatches={searchReplaceMatches}
                />
            </Provider>
        );
        act(() => {
            testingStore.dispatch(replaceCurrentMatch("abcd efg") as {} as AnyAction);
        });

        // WHEN
        actualNode.unmount();

        // THEN
        setTimeout(
            () => {
                expect(saveTrack).toHaveBeenCalledTimes(1);
                expect(testingStore.getState().cues[0].vttCue.text)
                    .toEqual("some <i>HTML</i> <b>abcd efg</b> sample");
                done();
            },
            3000
        );
    });

    it("doesn't update cue in redux when unmounted if no change to text", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        const editUuid = testingStore.getState().cues[0].editUuid;
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor
                    index={0}
                    vttCue={vttCue}
                    editUuid={editUuid}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                />
            </Provider>
        );

        // WHEN
        actualNode.unmount();

        // THEN
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1");
    });

    it("triggers autosave only once immediately after text change", (done) => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
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
                    context: { text: "txxt", length: 3, offset: 0 },
                    rule: { id: ruleId }
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
                    context: { text: "txxt", length: 4, offset: 7 },
                    rule: { id: ruleId }
                }
            ]
        };

        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

        // @ts-ignore modern browsers does have it
        global.fetch = jest.fn()
            .mockImplementation(() =>
                new Promise((resolve) => resolve({ json: () => testingResponse, ok: true })));

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
                    {
                        method: "POST",
                        body: "language=en-US&text=someText Paste text to end" +
                            "&disabledRules=UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END"
                    }
                );
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledTimes(3);
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
                    context: { text: "txxt", length: 3, offset: 0 },
                    rule: { id: ruleId }
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
                    context: { text: "txxt", length: 4, offset: 7 },
                    rule: { id: ruleId }
                }
            ]
        };
        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

        // @ts-ignore modern browsers does have it
        global.fetch = jest.fn()
            .mockImplementation(() =>
                new Promise((resolve) => resolve({ json: () => testingResponse, ok: true })));

        const vttCue = new VTTCue(0, 1, "test to clear");
        const editUuid = testingStore.getState().cues[0].editUuid;
        const { container } = render(
            <Provider store={testingStore}>
                <CueTextEditor
                    index={0}
                    vttCue={vttCue}
                    editUuid={editUuid}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                />
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
                    {
                      method: "POST",
                      body: "language=en-US&text=test to clea" +
                          "&disabledRules=UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END"
                    }
                );
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledTimes(3);
                done();
            },
            6000
        );
    });

    it("doesn't trigger autosave when cue editor is rendered", (done) => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

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
