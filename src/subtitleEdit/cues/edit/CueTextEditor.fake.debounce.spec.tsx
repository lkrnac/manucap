/**  * @jest-environment jsdom-sixteen  */
import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import React, { ReactElement } from "react";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import Draft, { ContentState, convertFromHTML, Editor, EditorState, SelectionState } from "draft-js";
import { Options, stateToHTML } from "draft-js-export-html";
import Mousetrap from "mousetrap";

import { mount, ReactWrapper } from "enzyme";
import each from "jest-each";

import { Character, KeyCombination } from "../../utils/shortcutConstants";
import { createTestingStore } from "../../../testUtils/testingStore";
import {
    MockedDebouncedFunction,
    removeDraftJsDynamicValues,
    spellCheckOptionPredicate
} from "../../../testUtils/testUtils";
import { reset } from "./editorStatesSlice";
import { SubtitleSpecification } from "../../toolbox/model";
import { readSubtitleSpecification } from "../../toolbox/subtitleSpecifications/subtitleSpecificationSlice";
import { CueDto, CueError, Language, Track } from "../../model";
import { SearchReplaceMatches } from "../searchReplace/model";
import { updateCues, updateMatchedCues } from "../cuesList/cuesListActions";
import CueTextEditor, { CueTextEditorProps } from "./CueTextEditor";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { convertVttToHtml } from "./cueTextConverter";
import { fetchSpellCheck } from "../spellCheck/spellCheckFetch";
import { Replacement, SpellCheck } from "../spellCheck/model";
import { Overlay } from "react-bootstrap";
import { replaceCurrentMatch, setFind } from "../searchReplace/searchReplaceSlices";
import { act } from "react-dom/test-utils";
import { fireEvent, render } from "@testing-library/react";
import { setSpellCheckDomain } from "../../spellcheckerSettingsSlice";
import { setGlossaryTerm, updateEditingCueIndex } from "./cueEditorSlices";

jest.mock("lodash", () => (
    {
        debounce: (fn: MockedDebouncedFunction): Function => {
            fn.cancel = jest.fn();
            return fn;
        },
        get: jest.requireActual("lodash/get"),
        findIndex: jest.requireActual("lodash/findIndex"),
        findLastIndex: jest.requireActual("lodash/findLastIndex")
    }));
jest.mock("../spellCheck/spellCheckFetch");
// @ts-ignore we are mocking this function
fetchSpellCheck.mockImplementation(() => jest.fn());

let testingStore = createTestingStore();

const cues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

interface ReduxTestWrapperProps {
    store: Store;
    props: CueTextEditorProps;
}
const bindCueViewModeKeyboardShortcutSpy = jest.fn() as () => void;
const unbindCueViewModeKeyboardShortcutSpy = jest.fn() as () => void;
const ruleId = "MORFOLOGIK_RULE_EN_US";

const ReduxTestWrapper = (props: ReduxTestWrapperProps): ReactElement => (
    <Provider store={props.store}>
        <CueTextEditor
            bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
            unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
            index={props.props.index}
            vttCue={props.props.vttCue}
            editUuid={props.props.editUuid}
        />
    </Provider>
);

const createExpectedNode = (
    editorState: EditorState,
    duration: number,
    chars: number[],
    words: number[],
    cps: number[]
): ReactWrapper => mount(
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
            className="sbte-bottom-border"
            style={{
                flexBasis: "25%",
                display: "flex",
                justifyContent: "space-between",
                padding: "5px 10px 5px 10px"
            }}
        >
            <div className="sbte-small-font" style={{ paddingLeft: "5px", paddingTop: "10px" }}>
                <span>DURATION: <span className="sbte-green-text">{duration}s</span>, </span>
                <span>CHARACTERS: <span className="sbte-green-text">{chars.reduce((a, b) => a + b, 0)}</span>, </span>
                <span>WORDS: <span className="sbte-green-text">{words.reduce((a, b) => a + b, 0)}</span>, </span>
                <span>CPS: <span className="sbte-green-text">{cps.reduce((a, b) => a + b, 0).toFixed(1)}</span></span>
            </div>
        </div>
        <div
            className="sbte-form-control sbte-bottom-border"
            style={{
                display: "flex",
                flexDirection: "row",
                flexBasis: "50%",
                paddingLeft: "10px",
                paddingTop: "5px",
                paddingBottom: "5px",
                minHeight: "54px"
            }}
        >
            <div style={{ flex: 1 }}>
                <Editor editorState={editorState} onChange={jest.fn} spellCheck={false} />
            </div>
            <div style={{ flex: 0 }}>
                { chars.map((character: number, index: number) => (
                    <div key={index}><span className="sbte-count-tag">{character} ch</span><br /></div>
                )) }
            </div>
            <div style={{ flex: 0, paddingRight: "5px" }}>
                { words.map((word: number, index: number) => (
                    <div key={index}><span className="sbte-count-tag">{word} w</span><br /></div>
                )) }
            </div>
        </div>
        <div style={{ flexBasis: "25%", padding: "5px 10px 5px 10px" }}>
            <button style={{ marginRight: "5px " }} className="btn btn-outline-secondary"><b>B</b></button>
            <button style={{ marginRight: "5px " }} className="btn btn-outline-secondary"><i>I</i></button>
            <button style={{ marginRight: "5px " }} className="btn btn-outline-secondary"><u>U</u></button>
        </div>
    </div>
);

const createEditorNode = (text = "someText", spellcheck?: SpellCheck): React.ReactElement => {
    const vttCue = new VTTCue(0, 1, text);
    const editUuid = testingStore.getState().cues[0].editUuid;
    return (
        <Provider store={testingStore}>
            <CueTextEditor
                bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                index={0}
                vttCue={vttCue}
                editUuid={editUuid}
                spellCheck={spellcheck}
            />
        </Provider>);
};


const mountEditorNode = (text = "someText"): ReactWrapper => {
    const actualNode = mount(
        createEditorNode(text)
    );
    return actualNode.find(".public-DraftEditor-content");
};

const renderEditorNode = (text = "someText", spellCheck?: SpellCheck): HTMLElement => {
    const { container } = render(
        createEditorNode(text, spellCheck)
    );
    return container;
};

// @ts-ignore Cast to Options is needed, because "@types/draft-js-export-html" library doesn't allow null
// defaultBlockTag, but it is allowed in their docs: https://www.npmjs.com/package/draft-js-export-html#defaultblocktag
// TODO: is this would be updated in types definition, we can remove this explicit cast + ts-ignore
const convertToHtmlOptions = {
    inlineStyles: {
        BOLD: { element: "b" },
        ITALIC: { element: "i" },
    },
    defaultBlockTag: null,
} as Options;

const testInlineStyle = (vttCue: VTTCue, buttonIndex: number, expectedText: string): void => {
    // GIVEN
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
    const editorState = actualNode.find(Editor).props().editorState;
    const selectionState = editorState.getSelection();
    // select first 5 characters
    const newSelectionState = selectionState.set("anchorOffset", 0).set("focusOffset", 5) as SelectionState;

    // WHEN
    actualNode.find(Editor).props().onChange(EditorState.acceptSelection(editorState, newSelectionState));
    actualNode.find("button").at(buttonIndex).simulate("click");

    // THEN
    expect(testingStore.getState().cues[0].vttCue.text).toEqual(expectedText);
    const currentContent = testingStore.getState().editorStates.get(0).getCurrentContent();
    expect(stateToHTML(currentContent, convertToHtmlOptions)).toEqual(testingStore.getState().cues[0].vttCue.text);
};

const testForContentState = (
    contentState: ContentState,
    vttCue: VTTCue,
    expectedStateHtml: string,
    duration: number,
    characters: number[],
    words: number[],
    cps: number[]
): void => {
    let editorState = EditorState.createWithContent(contentState);
    editorState = EditorState.moveFocusToEnd(editorState);
    const expectedNode = createExpectedNode(editorState, duration, characters, words, cps);
    const editUuid = testingStore.getState().cues[0].editUuid;

    // WHEN
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

    // THEN
    expect(removeDraftJsDynamicValues(actualNode.html())).toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    const currentContent = testingStore.getState().editorStates.get(0).getCurrentContent();
    expect(stateToHTML(currentContent, convertToHtmlOptions)).toEqual(expectedStateHtml);
};

const testTrack = { mediaTitle: "testingTrack", language: { id: "en-US", name: "English", direction: "LTR" }};

describe("CueTextEditor", () => {
    beforeEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
        testingStore = createTestingStore();
        testingStore.dispatch(reset() as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
        // @ts-ignore we are mocking this function
        fetchSpellCheck.mockReset();
    });

    describe("rendering", () => {
        it("renders empty", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "");
            const contentState = ContentState.createFromText("");

            // NOTE: Following latest expectation is not configurable nature of draft-js-export-html.
            // See following line in their code
            // eslint-disable-next-line max-len
            // https://github.com/sstur/draft-js-utils/blob/fe6eb9853679e2040ca3ac7bf270156079ab35db/packages/draft-js-export-html/src/stateToHTML.js#L366
            testForContentState(contentState, vttCue, "<br>", 1, [ 0 ], [ 0 ], [ 0 ]);
        });

        it("renders with text", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            const contentState = ContentState.createFromText(vttCue.text);

            testForContentState(contentState, vttCue, "someText", 1, [ 8 ], [ 1 ], [ 8 ]);
        });

        it("renders with html", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b> sample");
            const processedHTML = convertFromHTML(vttCue.text);
            const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);

            testForContentState(contentState, vttCue, "some <i>HTML</i> <b>Text</b> sample", 1, [ 21 ], [ 4 ], [ 21 ]);
        });

        it("renders with multiple lines", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "some <i>HTML</i>\n <b>Text</b> sample");
            const processedHTML = convertFromHTML(convertVttToHtml(vttCue.text));
            const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);

            testForContentState(
                contentState, vttCue, "some <i>HTML</i><br>\n <b>Text</b> sample", 1, [ 9, 12 ], [ 2, 2 ], [ 9, 12 ]);
        });
    });

    describe("autosave", () => {
        it("triggers autosave and when changed", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            testingStore.dispatch(updateEditingTrack({ language: { id: "en-US" }} as Track) as {} as AnyAction);

            const editor = mountEditorNode();

            // WHEN
            editor.simulate("paste", {
                clipboardData: {
                    types: [ "text/plain" ],
                    getData: (): string => " Paste text to end",
                }
            });

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
        });

        it("doesn't trigger autosave when user selects text", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

            const vttCue = new VTTCue(0, 1, "some text");
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                        index={0}
                        vttCue={vttCue}
                    />
                </Provider>
            );
            const editorState = actualNode.find(Editor).props().editorState;
            const selectionState = editorState.getSelection();

            // WHEN
            // select first 5 characters
            const newSelectionState = selectionState.set("anchorOffset", 0).set("focusOffset", 5) as SelectionState;
            actualNode.find(Editor).props().onChange(EditorState.forceSelection(editorState, newSelectionState));

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(0);
        });
    });

    describe("keyboard shortcuts", () => {
        each([
            [ KeyCombination.MOD_SHIFT_O, Character.O_CHAR, true, true, false, false ],
            [ KeyCombination.MOD_SHIFT_O, Character.O_CHAR, false, true, true, false ],
            [ KeyCombination.MOD_SHIFT_O, Character.O_CHAR, false, true, false, true ],
            [ KeyCombination.MOD_SHIFT_LEFT, Character.ARROW_LEFT, true, true, false, false ],
            [ KeyCombination.MOD_SHIFT_LEFT, Character.ARROW_LEFT, false, true, true, false ],
            [ KeyCombination.MOD_SHIFT_LEFT, Character.ARROW_LEFT, false, true, false, true ],
            [ KeyCombination.MOD_SHIFT_RIGHT, Character.ARROW_RIGHT, true, true, false, false ],
            [ KeyCombination.MOD_SHIFT_RIGHT, Character.ARROW_RIGHT, false, true, true, false ],
            [ KeyCombination.MOD_SHIFT_RIGHT, Character.ARROW_RIGHT, false, true, false, true ],
            [ KeyCombination.MOD_SHIFT_UP, Character.ARROW_UP, true, true, false, false ],
            [ KeyCombination.MOD_SHIFT_UP, Character.ARROW_UP, false, true, true, false ],
            [ KeyCombination.MOD_SHIFT_UP, Character.ARROW_UP, false, true, false, true ],
            [ KeyCombination.MOD_SHIFT_DOWN, Character.ARROW_DOWN, true, true, false, false ],
            [ KeyCombination.MOD_SHIFT_DOWN, Character.ARROW_DOWN, false, true, true, false ],
            [ KeyCombination.MOD_SHIFT_DOWN, Character.ARROW_DOWN, false, true, false, true ],
            [ KeyCombination.MOD_SHIFT_SLASH, Character.SLASH_CHAR, true, true, false, false ],
            [ KeyCombination.MOD_SHIFT_SLASH, Character.SLASH_CHAR, false, true, true, false ],
            [ KeyCombination.MOD_SHIFT_SLASH, Character.SLASH_CHAR, false, true, false, true ],
            [ KeyCombination.MOD_SHIFT_ESCAPE, Character.ESCAPE, true, true, false, false ],
            [ KeyCombination.MOD_SHIFT_ESCAPE, Character.ESCAPE, false, true, true, false ],
            [ KeyCombination.MOD_SHIFT_ESCAPE, Character.ESCAPE, false, true, false, true ],
        ])
            .it("should handle '%s' keyboard shortcut", (
                expectedKeyCombination: KeyCombination,
                character: Character, metaKey: boolean, shiftKey: boolean, altKey: boolean, ctrlKey: boolean
            ) => {
                // GIVEN
                const mousetrapSpy = jest.spyOn(Mousetrap, "trigger");
                mousetrapSpy.mockReset();
                const editor = mountEditorNode();

                // WHEN
                editor.simulate("keyDown", { keyCode: character, metaKey, shiftKey, altKey, ctrlKey });

                // THEN
                expect(mousetrapSpy).toBeCalledWith(expectedKeyCombination);
            });

        each([
            [ KeyCombination.ENTER, Character.ENTER ],
            [ KeyCombination.ESCAPE, Character.ESCAPE ],
        ])
            .it(
                "should handle '%s' keyboard shortcut",
                (expectedKeyCombination: KeyCombination, character: Character) => {
                    // GIVEN
                    const mousetrapSpy = jest.spyOn(Mousetrap, "trigger");
                    const editor = mountEditorNode();

                    // WHEN
                    editor.simulate("keyDown", { keyCode: character });

                    // THEN
                    expect(mousetrapSpy).toBeCalledWith(expectedKeyCombination);
                }
            );


        each([
            [ KeyCombination.ENTER, Character.ENTER ],
            [ KeyCombination.ESCAPE, Character.ESCAPE ],
        ])
            .it("should handle '%s' popover keyboard shortcut",
                (expectedKeyCombination: KeyCombination, character: Character) => {
                    // GIVEN
                    const mousetrapSpy = jest.spyOn(Mousetrap, "trigger");
                    const editor = mountEditorNode();

                    // WHEN
                    editor.simulate("keyDown", { keyCode: character });

                    // THEN
                    expect(mousetrapSpy).toBeCalledWith(expectedKeyCombination);
                });

        each([
            [ KeyCombination.ESCAPE, Character.ESCAPE, true, false, false, false ],
            [ KeyCombination.ESCAPE, Character.ESCAPE, false, true, false, false ],
            [ KeyCombination.ESCAPE, Character.ESCAPE, false, false, true, false ],
            [ KeyCombination.ESCAPE, Character.ESCAPE, false, false, false, true ],
            [ KeyCombination.ENTER, Character.ENTER, true, false, false, false ],
            [ KeyCombination.ENTER, Character.ENTER, false, true, false, false ],
            [ KeyCombination.ENTER, Character.ENTER, false, false, true, false ],
            [ KeyCombination.ENTER, Character.ENTER, false, false, false, true ],
        ])
            .it("doesn't handle '%s' keypress if modifier keys are pressed", (
                _expectedKeyCombination: KeyCombination, character: Character,
                metaKey: boolean, shiftKey: boolean, altKey: boolean, ctrlKey: boolean
            ) => {
                // GIVEN
                const mousetrapSpy = jest.spyOn(Mousetrap, "trigger");
                mousetrapSpy.mockReset();
                const editor = mountEditorNode();

                // WHEN
                editor.simulate("keyDown", { keyCode: character, metaKey, shiftKey, altKey, ctrlKey });

                // THEN
                expect(mousetrapSpy).not.toBeCalled();
            });

        it("should handle unbound key shortcuts", () => {
            // GIVEN
            const defaultKeyBinding = jest.spyOn(Draft, "getDefaultKeyBinding");
            const editor = mountEditorNode();

            // WHEN
            editor.simulate("keyDown", {
                keyCode: 8, // backspace
                metaKey: false,
                shiftKey: true,
                altKey: true,
            });

            // THEN
            expect(defaultKeyBinding).toBeCalled();
        });
    });

    describe("cue updates", () => {
        it("updated cue when bold inline style is used", () => {
            testInlineStyle(new VTTCue(0, 1, "someText"), 0, "<b>someT</b>ext");
        });

        it("updated cue when italic inline style is used", () => {
            testInlineStyle(new VTTCue(0, 1, "someText"), 1, "<i>someT</i>ext");
        });

        it("updated cue when underline inline style is used", () => {
            testInlineStyle(new VTTCue(0, 1, "someText"), 2, "<u>someT</u>ext");
        });

        it.skip("maintain cue styles when cue text changes", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            vttCue.position = 60;
            vttCue.align = "end";
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

            // WHEN
            editor.simulate("paste", {
                clipboardData: {
                    types: [ "text/plain" ],
                    getData: (): string => "Paste text to start: ",
                }
            });

            // THEN
            expect(testingStore.getState().cues[0].vttCue.position).toEqual(60);
            expect(testingStore.getState().cues[0].vttCue.align).toEqual("end");
        });

        it("updates cue in redux store when changed", () => {
            // GIVEN
            const editor = mountEditorNode();

            // WHEN
            editor.simulate("paste", {
                clipboardData: {
                    types: [ "text/plain" ],
                    getData: (): string => " Paste text to end",
                }
            });

            // THEN
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("someText Paste text to end");
        });

        it.skip("updates cue in Redux if position property is changed", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            vttCue.position = 3;
            const editUuid = testingStore.getState().cues[0].editUuid;

            const actualNode = mount(
                <ReduxTestWrapper
                    store={testingStore}
                    props={
                        {
                            index: 0, vttCue, editUuid,
                            bindCueViewModeKeyboardShortcut: bindCueViewModeKeyboardShortcutSpy,
                            unbindCueViewModeKeyboardShortcut: unbindCueViewModeKeyboardShortcutSpy
                        }
                    }
                />);

            // WHEN
            vttCue.position = 6;
            actualNode.setProps({ props: { index: 0, vttCue, editUuid }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.position).toEqual(6);
        });

        it.skip("updates cue in Redux if align property is changed", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            vttCue.align = "left";
            const editUuid = testingStore.getState().cues[0].editUuid;

            const actualNode = mount(
                <ReduxTestWrapper
                    store={testingStore}
                    props={{
                        index: 0, vttCue, editUuid,
                        bindCueViewModeKeyboardShortcut: bindCueViewModeKeyboardShortcutSpy,
                        unbindCueViewModeKeyboardShortcut: unbindCueViewModeKeyboardShortcutSpy

                    }}
                />);

            // WHEN
            vttCue.align = "right";
            actualNode.setProps({ props: { index: 0, vttCue, editUuid }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.align).toEqual("right");
        });

        it.skip("updates cue in Redux if lineAlign property is changed", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            vttCue.lineAlign = "start";
            const editUuid = testingStore.getState().cues[0].editUuid;

            const actualNode = mount(
                <ReduxTestWrapper
                    store={testingStore}
                    props={{
                        index: 0, vttCue, editUuid,
                        bindCueViewModeKeyboardShortcut: bindCueViewModeKeyboardShortcutSpy,
                        unbindCueViewModeKeyboardShortcut: unbindCueViewModeKeyboardShortcutSpy
                    }}
                />);

            // WHEN
            vttCue.lineAlign = "end";
            actualNode.setProps({ props: { index: 0, vttCue, editUuid }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.lineAlign).toEqual("end");
        });

        it.skip("updates cue in Redux if positionAlign property is changed", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            vttCue.positionAlign = "line-left";
            const editUuid = testingStore.getState().cues[0].editUuid;

            const actualNode = mount(
                <ReduxTestWrapper
                    store={testingStore}
                    props={{
                        index: 0, vttCue, editUuid,
                        bindCueViewModeKeyboardShortcut: bindCueViewModeKeyboardShortcutSpy,
                        unbindCueViewModeKeyboardShortcut: unbindCueViewModeKeyboardShortcutSpy
                    }}
                />);

            // WHEN
            vttCue.positionAlign = "line-right";
            actualNode.setProps({ props: { index: 0, vttCue, editUuid }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.positionAlign).toEqual("line-right");
        });

        it("updates cue in Redux if snapToLines property is changed", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            vttCue.snapToLines = false;
            const editUuid = testingStore.getState().cues[0].editUuid;

            const actualNode = mount(
                <ReduxTestWrapper
                    store={testingStore}
                    props={{
                        index: 0, vttCue, editUuid,
                        bindCueViewModeKeyboardShortcut: bindCueViewModeKeyboardShortcutSpy,
                        unbindCueViewModeKeyboardShortcut: unbindCueViewModeKeyboardShortcutSpy
                    }}
                />);

            // WHEN
            vttCue.snapToLines = true;
            actualNode.setProps({ props: { index: 0, vttCue, editUuid }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.snapToLines).toEqual(true);
        });

        it.skip("updates cue in Redux if size property is changed", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            vttCue.size = 80;
            const editUuid = testingStore.getState().cues[0].editUuid;
            const actualNode = mount(
                <ReduxTestWrapper
                    store={testingStore}
                    props={{
                        index: 0, vttCue, editUuid,
                        bindCueViewModeKeyboardShortcut: bindCueViewModeKeyboardShortcutSpy,
                        unbindCueViewModeKeyboardShortcut: unbindCueViewModeKeyboardShortcutSpy
                    }}
                />);

            // WHEN
            vttCue.size = 30;
            actualNode.setProps({ props: { index: 0, vttCue, editUuid }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.size).toEqual(30);
        });

        it.skip("updates cue in Redux if line property is changed", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            vttCue.line = 3;
            const editUuid = testingStore.getState().cues[0].editUuid;
            const actualNode = mount(
                <ReduxTestWrapper
                    store={testingStore}
                    props={{
                        index: 0, vttCue, editUuid,
                        bindCueViewModeKeyboardShortcut: bindCueViewModeKeyboardShortcutSpy,
                        unbindCueViewModeKeyboardShortcut: unbindCueViewModeKeyboardShortcutSpy
                    }}
                />);

            // WHEN
            vttCue.line = 6;
            actualNode.setProps({ props: { index: 0, vttCue, editUuid }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.line).toEqual(6);
        });

        it.skip("updates cue in Redux if vertical property is changed", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            vttCue.vertical = "rl";
            const editUuid = testingStore.getState().cues[0].editUuid;
            const actualNode = mount(
                <ReduxTestWrapper
                    store={testingStore}
                    props={{
                        index: 0, vttCue, editUuid,
                        bindCueViewModeKeyboardShortcut: bindCueViewModeKeyboardShortcutSpy,
                        unbindCueViewModeKeyboardShortcut: unbindCueViewModeKeyboardShortcutSpy
                    }}
                />);

            // WHEN
            vttCue.vertical = "lr";
            actualNode.setProps({ props: { index: 0, vttCue, editUuid }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.vertical).toEqual("lr");
        });

        it.skip("updates cue in Redux if ID property is changed", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            vttCue.id = "id";
            const editUuid = testingStore.getState().cues[0].editUuid;
            const actualNode = mount(
                <ReduxTestWrapper
                    store={testingStore}
                    props={{
                        index: 0, vttCue, editUuid,
                        bindCueViewModeKeyboardShortcut: bindCueViewModeKeyboardShortcutSpy,
                        unbindCueViewModeKeyboardShortcut: unbindCueViewModeKeyboardShortcutSpy
                    }}
                />);

            // WHEN
            vttCue.id = "differentId";
            actualNode.setProps({ props: { index: 0, vttCue, editUuid }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.id).toEqual("differentId");
        });

        it.skip("updates cue in Redux if pauseOnExit property is changed", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            vttCue.pauseOnExit = false;
            const editUuid = testingStore.getState().cues[0].editUuid;
            const actualNode = mount(
                <ReduxTestWrapper
                    store={testingStore}
                    props={{
                        index: 0, vttCue, editUuid,
                        bindCueViewModeKeyboardShortcut: bindCueViewModeKeyboardShortcutSpy,
                        unbindCueViewModeKeyboardShortcut: unbindCueViewModeKeyboardShortcutSpy
                    }}
                />);

            // WHEN
            vttCue.pauseOnExit = true;
            actualNode.setProps({ props: { index: 0, vttCue, editUuid }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.pauseOnExit).toEqual(true);
        });

        it("doesn't updates cue in redux store if new text doesn't conform to subtitle specification", () => {
            // GIVEN
            const editor = mountEditorNode();
            const testingSubtitleSpecification = {
                enabled: true,
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 30,
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

            // WHEN
            editor.simulate("paste", {
                clipboardData: {
                    types: [ "text/plain" ],
                    getData: (): string => "\n Paste text \n with few lines",
                }
            });

            // THEN
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("someText");
            expect(testingStore.getState().editorStates[0]).toBeUndefined();
        });
    });

    describe("spell checking", () => {
        beforeEach(() => {
            const trackId = "0fd7af04-6c87-4793-8d66-fdb19b5fd04d";
            const testingTrack = {
                type: "CAPTION",
                language: { id: "en-US", name: "English (US)" } as Language,
                default: true,
                mediaTitle: "This is the video title",
                mediaLength: 4000,
                progress: 50,
                id: trackId
            } as Track;
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
        });

        it("calls spellchecker once component loads and spellcheck is not passed", () => {
            // GIVEN, WHEN
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            renderEditorNode();

            // THEN
            expect(fetchSpellCheck).toBeCalledTimes(1);
        });

        it("does not call spellchecker once component loads if it is spellcheck is passed", () => {
            // GIVEN, WHEN
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            renderEditorNode("someText", { matches: []} as SpellCheck);

            // THEN
            expect(fetchSpellCheck).not.toBeCalled();
        });


        it("renders with html and spell check errors", () => {
            // GIVEN
            const spellCheck = {
                matches: [
                    { offset: 5, length: 4, replacements: [] as Replacement[],
                        context: { text: "asd1", length: 4, offset: 5 },
                        rule: { id: ruleId }},
                    { offset: 15, length: 6, replacements: [] as Replacement[],
                        context: { text: "asd2", length: 4, offset: 5 },
                        rule: { id: ruleId }}
                ]
            } as SpellCheck;
            const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b> sample");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const expectedContent = "<span data-offset-key=\"\"><span data-text=\"true\">some </span></span>" +
                "<span class=\"sbte-text-with-error\"><span data-offset-key=\"\" style=\"font-style: italic;\">" +
                "<span data-text=\"true\">HTML</span></span></span>" +
                "<span data-offset-key=\"\"><span data-text=\"true\"> </span></span>" +
                "<span data-offset-key=\"\" style=\"font-weight: bold;\"><span data-text=\"true\">Text</span></span>" +
                "<span data-offset-key=\"\"><span data-text=\"true\"> </span></span>" +
                "<span class=\"sbte-text-with-error\"><span data-offset-key=\"\">" +
                "<span data-text=\"true\">sample</span></span>";

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                        index={0}
                        vttCue={vttCue}
                        editUuid={editUuid}
                        spellCheck={spellCheck}
                    />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.html())).toContain(expectedContent);
        });

        each([
            [Character.ENTER, true, false, false, false],
            [Character.ENTER, false, true, false, false],
            [Character.ENTER, false, false, true, false],
            [Character.ENTER, false, false, false, true],
            [Character.ENTER, false, false, true, true],
            [Character.ENTER, true, false, true, false],
        ])
            .it("renders plain text with correctly placed spell check error when new line is added", (
                character: Character, metaKey: boolean, shiftKey: boolean, altKey: boolean, ctrlKey: boolean
            ) => {
                // GIVEN
                const spellCheck = {
                    matches: [
                        { offset: 2, length: 4, replacements: [] as Replacement[],
                          context: { text: "any", length: 4, offset: 2 },
                            rule: { id: ruleId }},
                    ]
                } as SpellCheck;
                const vttCue = new VTTCue(0, 1, "t");
                const editUuid = testingStore.getState().cues[0].editUuid;
                const expectedContent = "<span data-offset-key=\"\"><span data-text=\"true\">t\n</span></span>" +
                    "<span class=\"sbte-text-with-error\"><span data-offset-key=\"\">" +
                    "<span data-text=\"true\">ffff</span></span></span>";
                const actualNode = mount(
                    <Provider store={testingStore}>
                        <CueTextEditor
                            bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                            unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                            index={0}
                            vttCue={vttCue}
                            editUuid={editUuid}
                            spellCheck={spellCheck}
                        />
                    </Provider>
                );
                const editor = actualNode.find(".public-DraftEditor-content");

                // WHEN
                editor.simulate("keyDown", { keyCode: character, metaKey, shiftKey, altKey, ctrlKey });
                editor.simulate("paste", {
                    clipboardData: {
                        types: ["text/plain"],
                        getData: (): string => "ffff",
                    }
                });
                actualNode.setProps({ spellCheck });

                // THEN
                expect(removeDraftJsDynamicValues(actualNode.html())).toContain(expectedContent);
            });

        each([
            [Character.ENTER, true, false, false, false],
            [Character.ENTER, false, true, false, false],
            [Character.ENTER, false, false, true, false],
            [Character.ENTER, false, false, false, true],
            [Character.ENTER, false, false, true, true],
            [Character.ENTER, true, false, true, false],
        ])
            .it("renders styled text with correctly placed spell check error when new line is added", (
                character: Character, metaKey: boolean, shiftKey: boolean, altKey: boolean, ctrlKey: boolean
            ) => {
                // GIVEN
                const spellCheck = {
                    matches: [
                        { offset: 2, length: 4, replacements: [] as Replacement[],
                            context: { text: "any", length: 4, offset: 2 },
                            rule: { id: ruleId }},
                    ]
                } as SpellCheck;
                const vttCue = new VTTCue(0, 1, "<i>t</i>");
                const editUuid = testingStore.getState().cues[0].editUuid;
                const expectedContent = "<span data-offset-key=\"\" style=\"font-style: italic;\">" +
                    "<span data-text=\"true\">t\n</span></span>" +
                    "<span class=\"sbte-text-with-error\"><span data-offset-key=\"\" style=\"font-style: italic;\">" +
                    "<span data-text=\"true\">ffff</span></span></span>";
                const actualNode = mount(
                    <Provider store={testingStore}>
                        <CueTextEditor
                            bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                            unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                            index={0}
                            vttCue={vttCue}
                            editUuid={editUuid}
                            spellCheck={spellCheck}
                        />
                    </Provider>
                );
                const editor = actualNode.find(".public-DraftEditor-content");

                // WHEN
                editor.simulate("keyDown", { keyCode: character, metaKey, shiftKey, altKey, ctrlKey });
                editor.simulate("paste", {
                    clipboardData: {
                        types: ["text/plain"],
                        getData: (): string => "ffff",
                    }
                });
                actualNode.setProps({ spellCheck });

                // THEN
                expect(removeDraftJsDynamicValues(actualNode.html())).toContain(expectedContent);
            });

        it("replaces incorrectly spelled text with replacement when user picks one", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

            testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
            const spellCheck = {
                matches: [
                    { offset: 5, length: 3, replacements: [{ value: "option1" }, { value: "HTML" }] as Replacement[],
                        context: { text: "some <u><i>hTm</i></u> <b>Text</b> sample", length: 3, offset: 5 },
                        rule: { id: ruleId }},
                    { offset: 14, length: 6, replacements: [] as Replacement[],
                        context: { text: "some <u><i>hTm</i></u> <b>Text</b> sample", length: 6, offset: 14 },
                        rule: { id: ruleId }}
                ]
            } as SpellCheck;
            const vttCue = new VTTCue(0, 1, "some <u><i>hTm</i></u> <b>Text</b> sample");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                        index={0}
                        vttCue={vttCue}
                        editUuid={editUuid}
                        spellCheck={spellCheck}
                    />
                </Provider>
            );

            // WHEN
            actualNode.find(".sbte-text-with-error").at(0).simulate("click");
            actualNode.findWhere(spellCheckOptionPredicate(2)).at(0).simulate("click");

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("some <u><i>HTML</i></u> <b>Text</b> sample");
            expect(actualNode.find(Overlay).at(0).props().show).toBeFalsy();
        });

        it("closes other spell check popups when user opens new one", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            const spellCheck = {
                matches: [
                    { offset: 5, length: 3, replacements: [] as Replacement[],
                        context: { text: "some <u><i>hTm</i></u> <b>Text</b> sample", length: 3, offset: 5 },
                        rule: { id: ruleId }},
                    { offset: 14, length: 5, replacements: [] as Replacement[],
                        context: { text: "some <u><i>hTm</i></u> <b>Text</b> sample", length: 5, offset: 14 },
                        rule: { id: ruleId }}
                ]
            } as SpellCheck;
            const vttCue = new VTTCue(0, 1, "some hTm <b>Text</b> smple");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                        index={0}
                        vttCue={vttCue}
                        editUuid={editUuid}
                        spellCheck={spellCheck}
                    />
                </Provider>
            );
            actualNode.find(".sbte-text-with-error").at(0).simulate("click");
            actualNode.setProps({});

            // WHEN
            actualNode.find(".sbte-text-with-error").at(1).simulate("click");

            // THEN
            expect(actualNode.find(Overlay).at(0).props().show).toBeFalsy();
            expect(actualNode.find(Overlay).at(1).props().show).toBeTruthy();
        });

        it("closes spell check popup when user clicks on issue area again", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            const spellCheck = {
                matches: [
                    { offset: 5, length: 3, replacements: [] as Replacement[],
                        context: { text: "some <u><i>hTm</i></u> <b>Text</b> sample", length: 3, offset: 5 },
                        rule: { id: ruleId }},
                    { offset: 14, length: 5, replacements: [] as Replacement[],
                        context: { text: "some <u><i>hTm</i></u> <b>Text</b> sample", length: 5, offset: 14 },
                        rule: { id: ruleId }}
                ]
            } as SpellCheck;
            const vttCue = new VTTCue(0, 1, "some hTm <b>Text</b> smple");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                        index={0}
                        vttCue={vttCue}
                        editUuid={editUuid}
                        spellCheck={spellCheck}
                    />
                </Provider>
            );
            actualNode.find(".sbte-text-with-error").at(0).simulate("click");
            actualNode.setProps({});

            // WHEN
            actualNode.find(".sbte-text-with-error").at(0).simulate("click");

            // THEN
            expect(actualNode.find(Overlay).at(0).props().show).toBeFalsy();
        });

        it("shows spellcheck error on text even if trackId is undefined", () => {
            // GIVEN
            const testingTrack = {
                type: "CAPTION",
                language: { id: "en-US", name: "English (US)" } as Language,
                default: true,
                mediaTitle: "This is the video title",
                mediaLength: 4000,
                progress: 50,
                id: undefined
            } as Track;
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            const spellCheck = {
                matches: [
                    { offset: 8, length: 5, replacements: [{ "value": "Line" }] as Replacement[],
                        context: { text: "Caption Linex 1", offset: 8, length: 5 },
                        rule: { id: ruleId }
                    }
                ]
            } as SpellCheck;

            const cues = [
                { vttCue: new VTTCue(0, 2, "Caption Linex 1"),
                    cueCategory: "DIALOGUE", spellCheck: spellCheck,
                    errors: [CueError.SPELLCHECK_ERROR]},
                { vttCue: new VTTCue(2, 4, "Caption Linex 2"),
                    cueCategory: "DIALOGUE", spellCheck: spellCheck }
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // @ts-ignore modern browsers does have it
            global.fetch = jest.fn()
                .mockImplementationOnce(() => new Promise((resolve) =>
                    resolve({ json: () => spellCheck })));
            const editUuid = testingStore.getState().cues[0].editUuid;

            //WHEN
            const { container } = render(
                <Provider store={testingStore}>
                    <CueTextEditor
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                        index={0}
                        vttCue={testingStore.getState().cues[0].vttCue}
                        editUuid={editUuid}
                        spellCheck={spellCheck}
                    />
                </Provider>
            );

            //THEN
            const errorSpan = container.querySelectorAll(".sbte-text-with-error")[0] as Element;
            expect(errorSpan).not.toBeNull();
        });

        it("ignores all spell check matches and revalidate corrupted when clicking ignore all option", () => {
            // GIVEN
            const trackId = "0fd7af04-6c87-4793-8d66-fdb19b5fd04d";
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            testingStore.dispatch(reset() as {} as AnyAction);
            const testingTrack = {
                type: "CAPTION",
                language: { id: "en-US", name: "English (US)" } as Language,
                default: true,
                mediaTitle: "This is the video title",
                mediaLength: 4000,
                progress: 50,
                id: trackId
            } as Track;
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            const spellCheck = {
                matches: [
                    { offset: 8, length: 5, replacements: [{ "value": "Line" }] as Replacement[],
                        context: { text: "Caption Linex 1", offset: 8, length: 5 },
                        rule: { id: ruleId }
                    }
                ]
            } as SpellCheck;

            const cues = [
                { vttCue: new VTTCue(0, 2, "Caption Linex 1"),
                    cueCategory: "DIALOGUE", spellCheck: spellCheck,
                    errors: [CueError.SPELLCHECK_ERROR]},
                { vttCue: new VTTCue(2, 4, "Caption Linex 2"),
                    cueCategory: "DIALOGUE", spellCheck: spellCheck,
                    errors: [CueError.SPELLCHECK_ERROR]},
                { vttCue: new VTTCue(4, 6, "Caption Linex 2"),
                    cueCategory: "DIALOGUE", errors: [CueError.SPELLCHECK_ERROR]}
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(updateMatchedCues() as {} as AnyAction);

            // @ts-ignore modern browsers does have it
            global.fetch = jest.fn()
                .mockImplementationOnce(() => new Promise((resolve) =>
                    resolve({ json: () => spellCheck })));
            const editUuid = testingStore.getState().cues[0].editUuid;
            const { container } = render(
                <Provider store={testingStore}>
                    <CueTextEditor
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                        index={0}
                        vttCue={testingStore.getState().cues[0].vttCue}
                        editUuid={editUuid}
                        spellCheck={spellCheck}
                    />
                </Provider>
            );
            const errorSpan = container.querySelectorAll(".sbte-text-with-error")[0] as Element;
            fireEvent.click(errorSpan);

            //WHEN
            const ignoreOption = document.querySelectorAll(".spellcheck__option")[0] as Element;
            fireEvent.click(ignoreOption);

            // THEN
            //@ts-ignore value should not be null
            const ignores = JSON.parse(localStorage.getItem("SpellcheckerIgnores"));
            expect(ignores[trackId]).not.toBeNull();
            expect(testingStore.getState().cues[0].errors).toEqual([]);
            expect(testingStore.getState().cues[1].errors).toEqual([]);
            expect(testingStore.getState().cues[2].errors).toEqual([]);
            expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[0].cue.errors).toEqual([]);
            expect(testingStore.getState().matchedCues.matchedCues[1].targetCues[0].cue.errors).toEqual([]);
            expect(testingStore.getState().matchedCues.matchedCues[2].targetCues[0].cue.errors).toEqual([]);
            expect(saveTrack).toBeCalled();
        });

        it("ignores all spell check matches and revalidate corrupted when clicking ignore all option with all cue" +
            " text ignored", () => {
            // GIVEN
            const trackId = "0fd7af04-6c87-4793-8d66-fdb19b5fd04d";
            const cueText = "skupiając się na śledzeniu \n konwersji offline.";
            testingStore.dispatch(reset() as {} as AnyAction);
            const testingTrack = {
                type: "CAPTION",
                language: { id: "pl-PL", name: "Polish" } as Language,
                default: true,
                mediaTitle: "Sample Polish",
                mediaLength: 4000,
                progress: 50,
                id: trackId
            } as Track;
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            const spellCheck = {
                matches: [
                    { offset: 0, length: 46, replacements: [] as Replacement[],
                        context: { text: cueText,offset: 0, length: 46 },
                        rule: { id: ruleId }
                    }
                ]
            } as SpellCheck;

            const cues = [
                { vttCue: new VTTCue(0, 2, cueText),
                    cueCategory: "DIALOGUE", spellCheck: spellCheck,
                    errors: [CueError.SPELLCHECK_ERROR]},
                { vttCue: new VTTCue(2, 4, cueText),
                    cueCategory: "DIALOGUE", spellCheck: spellCheck,
                    errors: [CueError.SPELLCHECK_ERROR]}
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // @ts-ignore modern browsers does have it
            global.fetch = jest.fn()
                .mockImplementationOnce(() => new Promise((resolve) =>
                    resolve({ json: () => spellCheck })));
            const editUuid = testingStore.getState().cues[0].editUuid;
            const { container } = render(
                <Provider store={testingStore}>
                    <CueTextEditor
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                        index={0}
                        vttCue={testingStore.getState().cues[0].vttCue}
                        editUuid={editUuid}
                        spellCheck={spellCheck}
                    />
                </Provider>
            );
            const errorSpan = container.querySelectorAll(".sbte-text-with-error")[0] as Element;
            fireEvent(errorSpan,
                new MouseEvent("click", {
                    bubbles: true,
                    cancelable: true,
                })
            );

            //WHEN
            const ignoreOption = document.querySelectorAll(".spellcheck__option")[0] as Element;
            fireEvent(ignoreOption,
                new MouseEvent("click", {
                    bubbles: true,
                    cancelable: true,
                })
            );

            // THEN
            //@ts-ignore value should not be null
            const ignores = JSON.parse(localStorage.getItem("SpellcheckerIgnores"));
            expect(ignores[trackId]).not.toBeNull();
            expect(testingStore.getState().cues[0].errors).toEqual([]);
            expect(testingStore.getState().cues[1].errors).toEqual([]);
        });
    });

    describe("search and replace", () => {
        it("renders with html and search and replace results", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [10],
                offsetIndex: 0,
                matchLength: 4
            } as SearchReplaceMatches;
            const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b> sample");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const expectedContent =
                "<span style=\"background-color: rgb(217, 233, 255);\">" +
                "<span data-offset-key=\"\" style=\"font-weight: bold;\"><span data-text=\"true\">Text</span>" +
                "</span></span>";

            // WHEN
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

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.container.outerHTML)).toContain(expectedContent);
        });

        it("renders with html and search and replace results only first one with many offsets", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [10, 22],
                offsetIndex: 0,
                matchLength: 4
            } as SearchReplaceMatches;
            const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b> sample Text");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const expectedContent =
                "<span style=\"background-color: rgb(217, 233, 255);\">" +
                "<span data-offset-key=\"\" style=\"font-weight: bold;\"><span data-text=\"true\">Text</span>" +
                "</span></span>";
            const notExpectedContent =
                "<span style=\"background-color: rgb(217, 233, 255);\">" +
                "<span data-offset-key=\"\"><span data-text=\"true\">Text</span>" +
                "</span></span>";

            // WHEN
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

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.container.outerHTML)).toContain(expectedContent);
            expect(removeDraftJsDynamicValues(actualNode.container.outerHTML)).not.toContain(notExpectedContent);
        });

        it("renders with html and search and replace results only second one with many offsets", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [10, 22],
                offsetIndex: 1,
                matchLength: 4
            } as SearchReplaceMatches;
            const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b> sample Text");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const expectedContent =
                "<span style=\"background-color: rgb(217, 233, 255);\">" +
                "<span data-offset-key=\"\"><span data-text=\"true\">Text</span>" +
                "</span></span>";
            const notExpectedContent =
                "<span style=\"background-color: rgb(217, 233, 255);\">" +
                "<span data-offset-key=\"\" style=\"font-weight: bold;\"><span data-text=\"true\">Text</span>" +
                "</span></span>";

            // WHEN
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

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.container.outerHTML)).toContain(expectedContent);
            expect(removeDraftJsDynamicValues(actualNode.container.outerHTML)).not.toContain(notExpectedContent);
        });

        it("replace first occurrence for 3 matches per cue", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            testingStore.dispatch(setFind("text") as {} as AnyAction);
            const searchReplaceMatches = {
                offsets: [10, 22, 31],
                offsetIndex: 0,
                matchLength: 4
            } as SearchReplaceMatches;
            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "some <i>HTML</i> <b>Text</b> sample Text and Text"),
                    cueCategory: "DIALOGUE",
                    searchReplaceMatches
                } as CueDto,
                { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
            ];
            const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b> sample Text and Text");
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const editUuid = testingStore.getState().cues[0].editUuid;
            render(
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

            // WHEN
            act(() => {
                testingStore.dispatch(replaceCurrentMatch("abcd efg") as {} as AnyAction);
            });

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(testingStore.getState().cues[0].vttCue.text)
                .toEqual("some <i>HTML</i> <b>abcd efg</b> sample Text and Text");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().cues[0].searchReplaceMatches.offsets).toEqual([26, 35]);
            expect(testingStore.getState().cues[0].searchReplaceMatches.offsetIndex).toEqual(0);
            expect(testingStore.getState().searchReplace.replacement).toEqual("");
        });

        it("replace second occurrence for 3 matches per cue", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            testingStore.dispatch(setFind("Text") as {} as AnyAction);
            const searchReplaceMatches = {
                offsets: [10, 22, 31],
                offsetIndex: 1,
                matchLength: 4
            } as SearchReplaceMatches;
            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "some <i>HTML</i> <b>Text</b> sample Text and Text"),
                    cueCategory: "DIALOGUE",
                    searchReplaceMatches
                } as CueDto,
                { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
            ];
            const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b> sample Text and Text");
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const editUuid = testingStore.getState().cues[0].editUuid;
            render(
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

            // WHEN
            act(() => {
                testingStore.dispatch(replaceCurrentMatch("abcd efg") as {} as AnyAction);
            });

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(testingStore.getState().cues[0].vttCue.text)
                .toEqual("some <i>HTML</i> <b>Text</b> sample abcd efg and Text");
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().cues[0].searchReplaceMatches.offsets).toEqual([10, 35]);
            expect(testingStore.getState().cues[0].searchReplaceMatches.offsetIndex).toEqual(1);
            expect(testingStore.getState().searchReplace.replacement).toEqual("");
        });

        it("replace third occurrence for 3 matches per cue", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            testingStore.dispatch(setFind("Text") as {} as AnyAction);
            const searchReplaceMatches = {
                offsets: [10, 22, 31],
                offsetIndex: 2,
                matchLength: 4
            } as SearchReplaceMatches;
            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "some <i>HTML</i> <b>Text</b> sample Text and Text"),
                    cueCategory: "DIALOGUE",
                    searchReplaceMatches
                } as CueDto,
                { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
            ];
            const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b> sample Text and Text");
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const editUuid = testingStore.getState().cues[0].editUuid;
            render(
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

            // WHEN
            act(() => {
                testingStore.dispatch(replaceCurrentMatch("abcd efg") as {} as AnyAction);
            });

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(testingStore.getState().cues[0].vttCue.text)
                .toEqual("some <i>HTML</i> <b>Text</b> sample Text and abcd efg");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().cues[0].searchReplaceMatches.offsets).toEqual([10, 22]);
            expect(testingStore.getState().cues[0].searchReplaceMatches.offsetIndex).toEqual(1);
            expect(testingStore.getState().searchReplace.replacement).toEqual("");
        });

        it("replace match with regex special chars", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            const testTrack = { mediaTitle: "testingTrack",
                language: { id: "1", name: "English", direction: "LTR" }};
            testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
            testingStore.dispatch(setFind("[Text]") as {} as AnyAction);
            const searchReplaceMatches = {
                offsets: [10],
                offsetIndex: 0,
                matchLength: 6
            } as SearchReplaceMatches;
            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "some <i>HTML</i> <b>[Text]</b>"),
                    cueCategory: "DIALOGUE",
                    searchReplaceMatches
                } as CueDto,
                { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
            ];
            const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>[Text]</b>");
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const editUuid = testingStore.getState().cues[0].editUuid;
            render(
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

            // WHEN
            act(() => {
                testingStore.dispatch(replaceCurrentMatch("[TEXT TEST]") as {} as AnyAction);
            });

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(testingStore.getState().cues[0].vttCue.text)
                .toEqual("some <i>HTML</i> <b>[TEXT TEST]</b>");
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().cues[0].searchReplaceMatches.offsets).toEqual([]);
            expect(testingStore.getState().cues[0].searchReplaceMatches.offsetIndex).toEqual(-1);
            expect(testingStore.getState().searchReplace.replacement).toEqual("");
        });
    });

    describe("long lines", () => {
        beforeEach(() => {
            const trackId = "0fd7af04-6c87-4793-8d66-fdb19b5fd04d";
            const testingTrack = {
                type: "CAPTION",
                language: { id: "en-US", name: "English (US)" } as Language,
                default: true,
                mediaTitle: "This is the video title",
                mediaLength: 4000,
                progress: 50,
                id: trackId
            } as Track;
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        });

        it("renders with too long lines", () => {
            // GIVEN
            const testingSubtitleSpecification = {
                enabled: true,
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 30,
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            const spellCheck = { matches: []} as SpellCheck;
            const vttCue = new VTTCue(0, 1, "some very long text sample very long text sample");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const expectedContent = "<span data-offset-key=\"\">" +
                "<span data-text=\"true\">some very long text sample ver</span></span>" +
                "<span class=\"sbte-extra-text\" data-offset-key=\"\">" +
                "<span data-offset-key=\"\"><span data-text=\"true\">y long text sample</span></span>";

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor
                        index={0}
                        vttCue={vttCue}
                        editUuid={editUuid}
                        spellCheck={spellCheck}
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                    />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.html())).toContain(expectedContent);
        });

        it("renders with multiple too long lines", () => {
            // GIVEN
            const testingSubtitleSpecification = {
                enabled: true,
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 10,
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            const spellCheck = { matches: []} as SpellCheck;
            const vttCue = new VTTCue(0, 1, "some very long text\nsample very long text sample");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const expectedContent = "<span data-offset-key=\"\">" +
                "<span data-text=\"true\">some very </span></span>" +
                "<span class=\"sbte-extra-text\" data-offset-key=\"\">" +
                "<span data-offset-key=\"\">" +
                "<span data-text=\"true\">long text</span></span></span>" +
                "<span data-offset-key=\"\">" +
                "<span data-text=\"true\">\nsample ver</span></span>" +
                "<span class=\"sbte-extra-text\" data-offset-key=\"\">" +
                "<span data-offset-key=\"\">" +
                "<span data-text=\"true\">y long text sample</span></span></span>";

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor
                        index={0}
                        vttCue={vttCue}
                        editUuid={editUuid}
                        spellCheck={spellCheck}
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                    />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.html())).toContain(expectedContent);
        });

        it("renders with too long lines and no subtitle specs", () => {
            // GIVEN
            const spellCheck = { matches: []} as SpellCheck;
            const vttCue = new VTTCue(0, 1, "some very long text sample very long text sample");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const expectedContent = "<span data-offset-key=\"\">" +
                "<span data-text=\"true\">some very long text sample very long text sample</span></span>";

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor
                        index={0}
                        vttCue={vttCue}
                        editUuid={editUuid}
                        spellCheck={spellCheck}
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                    />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.html())).toContain(expectedContent);
        });

        it("does not render with too long lines decorator with subtitle specs disabled", () => {
            // GIVEN
            const testingSubtitleSpecification = {
                enabled: false,
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 30,
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            const spellCheck = { matches: []} as SpellCheck;
            const vttCue = new VTTCue(0, 1, "some very long text sample very long text sample");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const expectedContent = "<span data-offset-key=\"\">" +
                "<span data-text=\"true\">some very long text sample very long text sample</span></span>";

            // WHEN
            const { container } = render(
                <Provider store={testingStore}>
                    <CueTextEditor
                        index={0}
                        vttCue={vttCue}
                        editUuid={editUuid}
                        spellCheck={spellCheck}
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                    />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(container.outerHTML)).toContain(expectedContent);
            expect(removeDraftJsDynamicValues(container.outerHTML))
                .not.toContain("<span class=\"sbte-extra-text\" data-offset-key=\"\">");
        });

        it("does not render with too long lines decorator with subtitle specs maxCharactersPerLine null", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    enabled: true,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: null,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const spellCheck = { matches: []} as SpellCheck;
                const vttCue = new VTTCue(0, 1, "some very long text sample very long text sample");
                const editUuid = testingStore.getState().cues[0].editUuid;
                const expectedContent = "<span data-offset-key=\"\">" +
                    "<span data-text=\"true\">some very long text sample very long text sample</span></span>";

                // WHEN
                const { container } = render(
                    <Provider store={testingStore}>
                        <CueTextEditor
                            index={0}
                            vttCue={vttCue}
                            editUuid={editUuid}
                            spellCheck={spellCheck}
                            bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                            unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                        />
                    </Provider>
                );

            // THEN
            expect(removeDraftJsDynamicValues(container.outerHTML)).toContain(expectedContent);
            expect(removeDraftJsDynamicValues(container.outerHTML))
                .not.toContain("<span class=\"sbte-extra-text\" data-offset-key=\"\">");
        });

        it("does not render with too long lines decorator with subtitle specs maxCharactersPerLine 0", () => {
            // GIVEN
            const testingSubtitleSpecification = {
                enabled: true,
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 0,
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            const spellCheck = { matches: []} as SpellCheck;
            const vttCue = new VTTCue(0, 1, "some very long text sample very long text sample");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const expectedContent = "<span data-offset-key=\"\">" +
                "<span data-text=\"true\">some very long text sample very long text sample</span></span>";

            // WHEN
            const { container } = render(
                <Provider store={testingStore}>
                    <CueTextEditor
                        index={0}
                        vttCue={vttCue}
                        editUuid={editUuid}
                        spellCheck={spellCheck}
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                    />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(container.outerHTML)).toContain(expectedContent);
            expect(removeDraftJsDynamicValues(container.outerHTML))
                .not.toContain("<span class=\"sbte-extra-text\" data-offset-key=\"\">");
        });

        it("renders with too long lines and spell check errors", () => {
            // GIVEN
            testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
            const testingSubtitleSpecification = {
                enabled: true,
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 30,
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
            const spellCheck = {
                matches: [{ offset: 5, length: 5, replacements: [] as Replacement[],
                    context: { text: "some verry long text sample very long text sample", length: 5, offset: 5 },
                    rule: { id: ruleId }}]
            } as SpellCheck;

            const vttCue = new VTTCue(0, 1, "some verry long text sample very long text sample");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const expectedContent = "<span data-offset-key=\"\"><span data-text=\"true\">some </span></span>" +
                "<span class=\"sbte-text-with-error\"><span data-offset-key=\"\">" +
                "<span data-text=\"true\">verry</span></span></span>" +
                "<span data-offset-key=\"\"><span data-text=\"true\"> long text sample ve</span></span>" +
                "<span class=\"sbte-extra-text\" data-offset-key=\"\">" +
                "<span data-offset-key=\"\"><span data-text=\"true\">ry long text sample</span></span></span>";

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor
                        index={0}
                        vttCue={vttCue}
                        editUuid={editUuid}
                        spellCheck={spellCheck}
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                    />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.html())).toContain(expectedContent);
        });
    });

    describe("glossary", () => {
        it("appends glossary term at the end of content and resets it in redux to null", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

            const vttCue = new VTTCue(0, 1, "some text");
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                        index={0}
                        vttCue={vttCue}
                        editUuid={testingStore.getState().cues[0].editUuid}
                    />
                </Provider>
            );

            // WHEN
            testingStore.dispatch(setGlossaryTerm("replacement") as {} as AnyAction);
            actualNode.setProps({});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("some textreplacement");
            const currentContent = testingStore.getState().editorStates.get(0).getCurrentContent();
            expect(stateToHTML(currentContent, convertToHtmlOptions)).toEqual("some textreplacement");
            expect(testingStore.getState().glossaryTerm).toEqual(null);
        });

        it("inserts glossary term into the middle of content and resets it in redux to null", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

            const vttCue = new VTTCue(0, 1, "some text");
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                        index={0}
                        vttCue={vttCue}
                        editUuid={testingStore.getState().cues[0].editUuid}
                    />
                </Provider>
            );
            const editorState = actualNode.find(Editor).props().editorState;
            const selectionState = editorState.getSelection();

            // WHEN
            const newSelectionState = selectionState.set("anchorOffset", 5).set("focusOffset", 5) as SelectionState;
            actualNode.find(Editor).props().onChange(EditorState.forceSelection(editorState, newSelectionState));
            testingStore.dispatch(setGlossaryTerm("replacement") as {} as AnyAction);
            actualNode.setProps({});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("some replacementtext");
            const currentContent = testingStore.getState().editorStates.get(0).getCurrentContent();
            expect(stateToHTML(currentContent, convertToHtmlOptions)).toEqual("some replacementtext");
            expect(testingStore.getState().glossaryTerm).toEqual(null);
        });
    });

    describe("special use cases", () => {
        it("inserts &lrm; bidi control character at cursor position for LTR language", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

            const vttCue = new VTTCue(0, 1, "some text");
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueTextEditor
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                        index={0}
                        vttCue={vttCue}
                        editUuid={testingStore.getState().cues[0].editUuid}
                    />
                </Provider>
            );
            const editor = actualNode.container.querySelector(".public-DraftEditor-content") as Element;

            // WHEN
            fireEvent.keyDown(editor, { keyCode: Character.B_CHAR, shiftKey: true, ctrlKey: true, metaKey: true });

            // THEN
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("some text\u200E");
            const currentContent = testingStore.getState().editorStates.get(0).getCurrentContent();
            expect(stateToHTML(currentContent, convertToHtmlOptions)).toEqual("some text\u200E");
        });

        it("inserts &rlm; bidi control character at cursor position for RTL language", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            const testTrack = {
                mediaTitle: "testingTrack",
                language: { id: "ar-AR", name: "Arabic", direction: "RTL" }
            };
            testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);

            const vttCue = new VTTCue(0, 1, "some text");
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueTextEditor
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                        index={0}
                        vttCue={vttCue}
                        editUuid={testingStore.getState().cues[0].editUuid}
                    />
                </Provider>
            );
            const editor = actualNode.container.querySelector(".public-DraftEditor-content") as Element;

            // WHEN
            fireEvent.keyDown(editor, { keyCode: Character.B_CHAR, shiftKey: true, ctrlKey: true, metaKey: true });

            // THEN
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("some text\u200F");
            const currentContent = testingStore.getState().editorStates.get(0).getCurrentContent();
            expect(stateToHTML(currentContent, convertToHtmlOptions)).toEqual("some text\u200F");
        });

        it("replaces cue text if apply-entity bug happens", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            const testTrack = {
                mediaTitle: "testingTrack",
                language: { id: "ar-AR", name: "Arabic", direction: "RTL" }
            };
            testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);

            const vttCue = new VTTCue(0, 1, "some text");
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor
                        bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                        unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                        index={0}
                        vttCue={vttCue}
                        editUuid={testingStore.getState().cues[0].editUuid}
                    />
                </Provider>
            );

            // WHEN
            const contentState = ContentState.createFromText("some te");
            const editorState = EditorState.createEmpty();
            const newState = EditorState.push(editorState, contentState, "apply-entity");
            actualNode.find(Editor).props().onChange(newState);

            // THEN
            expect(testingStore.getState().editorStates.get(0).getCurrentContent().getPlainText()).toEqual("some text");
        });

        /**
         * This is needed because of VTT vs HTML differences (HTML is native format of draft-js).
         * Currently this includes only line wrappings ('\n' vs '<br>').
         */
        it("does the VTT <-> HTML conversion", () => {
            // GIVEN
            const editor = mountEditorNode("some\nwrapped\ntext");

            // WHEN
            editor.simulate("paste", {
                clipboardData: {
                    types: ["text/plain"],
                    getData: (): string => " lala",
                }
            });

            // THEN
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("some\nwrapped\ntext lala");
        });
    });
});
