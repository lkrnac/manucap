/**  * @jest-environment jsdom-sixteen  */
import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import React, { ReactElement } from "react";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import Draft, { ContentState, convertFromHTML, Editor, EditorState, SelectionState } from "draft-js";
import { Options, stateToHTML } from "draft-js-export-html";

import { mount, ReactWrapper } from "enzyme";
import each from "jest-each";

import { Character, KeyCombination } from "../../shortcutConstants";
import { createTestingStore } from "../../../testUtils/testingStore";
import {
    MockedDebouncedFunction,
    removeDraftJsDynamicValues,
    spellCheckOptionPredicate
} from "../../../testUtils/testUtils";
import { reset } from "./editorStatesSlice";
import { SubtitleSpecification } from "../../toolbox/model";
import { readSubtitleSpecification } from "../../toolbox/subtitleSpecificationSlice";
import { CueDto, SearchReplaceMatches, Track } from "../../model";
import { updateCues } from "../cueSlices";
import CueTextEditor, { CueTextEditorProps } from "./CueTextEditor";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { convertVttToHtml } from "../cueTextConverter";
import { fetchSpellCheck } from "../spellCheck/spellCheckFetch";
import { Replacement, SpellCheck } from "../spellCheck/model";
import { Overlay } from "react-bootstrap";
import { setSpellCheckDomain } from "../spellCheck/spellCheckSlices";
import { replaceCurrentMatch, setReplacement } from "./searchReplaceSlices";
import { act } from "react-dom/test-utils";
import { render } from "@testing-library/react";

jest.mock("lodash", () => (
    {
        debounce: (fn: MockedDebouncedFunction): Function => {
            fn.cancel = jest.fn();
            return fn;
        }
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

const ReduxTestWrapper = (props: ReduxTestWrapperProps): ReactElement => (
    <Provider store={props.store}>
        <CueTextEditor index={props.props.index} vttCue={props.props.vttCue} editUuid={props.props.editUuid} />
    </Provider>
);

const createExpectedNode = (
    editorState: EditorState,
    duration: number,
    chars: number[],
    words: number[]
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
                <span>WORDS: <span className="sbte-green-text">{words.reduce((a, b) => a + b, 0)}</span></span>
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
            <CueTextEditor index={0} vttCue={vttCue} editUuid={editUuid} />
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
    words: number[]
): void => {
    let editorState = EditorState.createWithContent(contentState);
    editorState = EditorState.moveFocusToEnd(editorState);
    const expectedNode = createExpectedNode(editorState, duration, characters, words);
    const editUuid = testingStore.getState().cues[0].editUuid;

    // WHEN
    const actualNode = mount(
        <Provider store={testingStore}>
            <CueTextEditor index={0} vttCue={vttCue} editUuid={editUuid} />
        </Provider>
    );

    // THEN
    expect(removeDraftJsDynamicValues(actualNode.html())).toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    const currentContent = testingStore.getState().editorStates.get(0).getCurrentContent();
    expect(testingStore.getState().cues[0].vttCue.text).toEqual(vttCue.text);
    expect(stateToHTML(currentContent, convertToHtmlOptions)).toEqual(expectedStateHtml);
};

describe("CueTextEditor", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(reset() as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        // @ts-ignore we are mocking this function
        fetchSpellCheck.mockReset();
    });

    it("renders empty", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "");
        const contentState = ContentState.createFromText("");

        // NOTE: Following latest expectation is not configurable nature of draft-js-export-html.
        // See following line in their code
        // eslint-disable-next-line max-len
        // https://github.com/sstur/draft-js-utils/blob/fe6eb9853679e2040ca3ac7bf270156079ab35db/packages/draft-js-export-html/src/stateToHTML.js#L366
        testForContentState(contentState, vttCue, "<br>", 1, [0], [0]);
    });

    it("renders with text", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        const contentState = ContentState.createFromText(vttCue.text);

        testForContentState(contentState, vttCue, "someText", 1, [8], [1]);
    });

    it("renders with html", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b> sample");
        const processedHTML = convertFromHTML(vttCue.text);
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);

        testForContentState(contentState, vttCue, "some <i>HTML</i> <b>Text</b> sample", 1, [21], [4]);
    });

    it("renders with multiple lines", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some <i>HTML</i>\n <b>Text</b> sample");
        const processedHTML = convertFromHTML(convertVttToHtml(vttCue.text));
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);

        testForContentState(contentState, vttCue, "some <i>HTML</i><br>\n <b>Text</b> sample", 1, [9,12], [2,2]);
    });

    it("updates cue in redux store when changed", () => {
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
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("someText Paste text to end");
    });

    it("triggers autosave and when changed", () => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({ language: { id: "testing-language" }} as Track) as {} as AnyAction);

        const editor = createEditorNode();

        // WHEN
        editor.simulate("paste", {
            clipboardData: {
                types: ["text/plain"],
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
        testingStore.dispatch(updateEditingTrack({ language: { id: "testing-language" }} as Track) as {} as AnyAction);

        const vttCue = new VTTCue(0, 1, "some text");
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor index={0} vttCue={vttCue} />
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

    /**
     * This is needed because of VTT vs HTML differences (HTML is native format of draft-js).
     * Currently this includes only line wrappings ('\n' vs '<br>').
     */
    it("does the VTT <-> HTML conversion", () => {
        // GIVEN
        const editor = createEditorNode("some\nwrapped\ntext");

        // WHEN
        editor.simulate("paste", {
            clipboardData: {
                types: ["text/plain"],
                getData: (): string => "",
            }
        });

        // THEN
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("some\nwrapped\ntext");
    });

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
            <Provider store={testingStore} >
                <CueTextEditor index={0} vttCue={vttCue} editUuid={editUuid} />
            </Provider>
        );
        const editor = actualNode.find(".public-DraftEditor-content");

        // WHEN
        editor.simulate("paste", {
            clipboardData: {
                types: ["text/plain"],
                getData: (): string => "Paste text to start: ",
            }
        });

        // THEN
        expect(testingStore.getState().cues[0].vttCue.position).toEqual(60);
        expect(testingStore.getState().cues[0].vttCue.align).toEqual("end");
    });

    each([
        [KeyCombination.MOD_SHIFT_O, Character.O_CHAR, true, true, false, false],
        [KeyCombination.MOD_SHIFT_O, Character.O_CHAR, false, true, true, false],
        [KeyCombination.MOD_SHIFT_O, Character.O_CHAR, false, true, false, true],
        [KeyCombination.MOD_SHIFT_LEFT, Character.ARROW_LEFT, true, true, false, false],
        [KeyCombination.MOD_SHIFT_LEFT, Character.ARROW_LEFT, false, true, true, false],
        [KeyCombination.MOD_SHIFT_LEFT, Character.ARROW_LEFT, false, true, false, true],
        [KeyCombination.MOD_SHIFT_RIGHT, Character.ARROW_RIGHT, true, true, false, false],
        [KeyCombination.MOD_SHIFT_RIGHT, Character.ARROW_RIGHT, false, true, true, false],
        [KeyCombination.MOD_SHIFT_RIGHT, Character.ARROW_RIGHT, false, true, false, true],
        [KeyCombination.MOD_SHIFT_UP, Character.ARROW_UP, true, true, false, false],
        [KeyCombination.MOD_SHIFT_UP, Character.ARROW_UP, false, true, true, false],
        [KeyCombination.MOD_SHIFT_UP, Character.ARROW_UP, false, true, false, true],
        [KeyCombination.MOD_SHIFT_DOWN, Character.ARROW_DOWN, true, true, false, false],
        [KeyCombination.MOD_SHIFT_DOWN, Character.ARROW_DOWN, false, true, true, false],
        [KeyCombination.MOD_SHIFT_DOWN, Character.ARROW_DOWN, false, true, false, true],
        [KeyCombination.MOD_SHIFT_SLASH, Character.SLASH_CHAR, true, true, false, false],
        [KeyCombination.MOD_SHIFT_SLASH, Character.SLASH_CHAR, false, true, true, false],
        [KeyCombination.MOD_SHIFT_SLASH, Character.SLASH_CHAR, false, true, false, true],
        [KeyCombination.MOD_SHIFT_ESCAPE, Character.ESCAPE, true, true, false, false],
        [KeyCombination.MOD_SHIFT_ESCAPE, Character.ESCAPE, false, true, true, false],
        [KeyCombination.MOD_SHIFT_ESCAPE, Character.ESCAPE, false, true, false, true],
    ])
        .it("should handle '%s' keyboard shortcut", (
            expectedKeyCombination: KeyCombination,
            character: Character, metaKey: boolean, shiftKey: boolean, altKey: boolean, ctrlKey: boolean
        ) => {
            // GIVEN
            const mousetrapSpy = jest.spyOn(Mousetrap, "trigger");
            mousetrapSpy.mockReset();
            const editor = createEditorNode();

            // WHEN
            editor.simulate("keyDown", { keyCode: character, metaKey, shiftKey, altKey, ctrlKey });

            // THEN
            expect(mousetrapSpy).toBeCalledWith(expectedKeyCombination);
        });

    each([
        [KeyCombination.ENTER, Character.ENTER],
        [KeyCombination.ESCAPE, Character.ESCAPE],
    ])
        .it("should handle '%s' keyboard shortcut", (expectedKeyCombination: KeyCombination, character: Character) => {
            // GIVEN
            const mousetrapSpy = jest.spyOn(Mousetrap, "trigger");
            const editor = createEditorNode();

            // WHEN
            editor.simulate("keyDown", { keyCode: character });

            // THEN
            expect(mousetrapSpy).toBeCalledWith(expectedKeyCombination);
        });

    each([
        [KeyCombination.ESCAPE, Character.ESCAPE, true, false, false, false],
        [KeyCombination.ESCAPE, Character.ESCAPE, false, true, false, false],
        [KeyCombination.ESCAPE, Character.ESCAPE, false, false, true, false],
        [KeyCombination.ESCAPE, Character.ESCAPE, false, false, false, true],
        [KeyCombination.ENTER, Character.ENTER, true, false, false, false],
        [KeyCombination.ENTER, Character.ENTER, false, true, false, false],
        [KeyCombination.ENTER, Character.ENTER, false, false, true, false],
        [KeyCombination.ENTER, Character.ENTER, false, false, false, true],
    ])
        .it("doesn't handle '%s' keypress if modifier keys are pressed", (
            _expectedKeyCombination: KeyCombination, character: Character,
            metaKey: boolean, shiftKey: boolean, altKey: boolean, ctrlKey: boolean
        ) => {
            // GIVEN
            const mousetrapSpy = jest.spyOn(Mousetrap, "trigger");
            mousetrapSpy.mockReset();
            const editor = createEditorNode();

            // WHEN
            editor.simulate("keyDown", { keyCode: character, metaKey, shiftKey, altKey, ctrlKey });

            // THEN
            expect(mousetrapSpy).not.toBeCalled();
        });

    it("should handle unbound key shortcuts", () => {
        // GIVEN
        const defaultKeyBinding = jest.spyOn(Draft, "getDefaultKeyBinding");
        const editor = createEditorNode();

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

    it.skip("updates cue in Redux if position property is changed", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.position = 3;
        const editUuid = testingStore.getState().cues[0].editUuid;

        const actualNode = mount(<ReduxTestWrapper store={testingStore} props={{ index: 0, vttCue, editUuid }} />);

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

        const actualNode = mount(<ReduxTestWrapper store={testingStore} props={{ index: 0, vttCue, editUuid }} />);

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

        const actualNode = mount(<ReduxTestWrapper store={testingStore} props={{ index: 0, vttCue, editUuid }} />);

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

        const actualNode = mount(<ReduxTestWrapper store={testingStore} props={{ index: 0, vttCue, editUuid }} />);

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

        const actualNode = mount(<ReduxTestWrapper store={testingStore} props={{ index: 0, vttCue, editUuid }} />);

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
        const actualNode = mount(<ReduxTestWrapper store={testingStore} props={{ index: 0, vttCue, editUuid }} />);

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

        const actualNode = mount(<ReduxTestWrapper store={testingStore} props={{ index: 0, vttCue, editUuid }} />);

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
        const actualNode = mount(<ReduxTestWrapper store={testingStore} props={{ index: 0, vttCue, editUuid }} />);

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
        const actualNode = mount(<ReduxTestWrapper store={testingStore} props={{ index: 0, vttCue, editUuid }} />);

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
        const actualNode = mount(<ReduxTestWrapper store={testingStore} props={{ index: 0, vttCue, editUuid }} />);

        // WHEN
        vttCue.pauseOnExit = true;
        actualNode.setProps({ props: { index: 0, vttCue, editUuid }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.pauseOnExit).toEqual(true);
    });

    it("hides add cue button", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor index={0} vttCue={vttCue} />
            </Provider>
        );

        // THEN
        expect(actualNode.find(".sbte-add-cue-button")).toEqual({});
    });

    it("hides delete cue button", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor index={0} vttCue={vttCue} />
            </Provider>
        );

        // THEN
        expect(actualNode.find(".sbte-delete-cue-button")).toEqual({});
    });

    it("doesn't updates cue in redux store if new text doesn't conform to subtitle specification", () => {
        // GIVEN
        const editor = createEditorNode();
        const testingSubtitleSpecification = {
            enabled: true,
            maxLinesPerCaption: 2,
            maxCharactersPerLine: 30,
        } as SubtitleSpecification;
        testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

        // WHEN
        editor.simulate("paste", {
            clipboardData: {
                types: ["text/plain"],
                getData: (): string => "\n Paste text \n with few lines",
            }
        });

        // THEN
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("someText");
        expect(testingStore.getState().editorStates[0]).toBeUndefined();
    });

    describe("spell checking", () => {
        it("renders with html and spell check errors", () => {
            // GIVEN
            const spellCheck = {
                matches: [
                    { offset: 5, length: 4, replacements: [] as Replacement[] },
                    { offset: 15, length: 6, replacements: [] as Replacement[] }
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
                    <CueTextEditor index={0} vttCue={vttCue} editUuid={editUuid} spellCheck={spellCheck} />
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
                        { offset: 2, length: 4, replacements: [] as Replacement[] },
                    ]
                } as SpellCheck;
                const vttCue = new VTTCue(0, 1, "t");
                const editUuid = testingStore.getState().cues[0].editUuid;
                const expectedContent = "<span data-offset-key=\"\"><span data-text=\"true\">t\n</span></span>" +
                    "<span class=\"sbte-text-with-error\"><span data-offset-key=\"\">" +
                    "<span data-text=\"true\">ffff</span></span></span>";
                const actualNode = mount(
                    <Provider store={testingStore}>
                        <CueTextEditor index={0} vttCue={vttCue} editUuid={editUuid} spellCheck={spellCheck} />
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
                        { offset: 2, length: 4, replacements: [] as Replacement[] },
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
                        <CueTextEditor index={0} vttCue={vttCue} editUuid={editUuid} spellCheck={spellCheck} />
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
            testingStore.dispatch(
                updateEditingTrack({ language: { id: "testing-language" }} as Track) as {} as AnyAction
            );
            testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
            const spellCheck = {
                matches: [
                    { offset: 5, length: 3, replacements: [{ value: "option1" }, { value: "HTML" }] as Replacement[] },
                    { offset: 14, length: 6, replacements: [] as Replacement[] }
                ]
            } as SpellCheck;
            const vttCue = new VTTCue(0, 1, "some <u><i>hTm</i></u> <b>Text</b> sample");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor index={0} vttCue={vttCue} editUuid={editUuid} spellCheck={spellCheck} />
                </Provider>
            );

            // WHEN
            actualNode.find(".sbte-text-with-error").at(0).simulate("click");
            actualNode.findWhere(spellCheckOptionPredicate(1)).at(0).simulate("click");

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("some <u><i>HTML</i></u> <b>Text</b> sample");
            expect(actualNode.find(Overlay).at(0).props().show).toBeFalsy();
        });

        it("closes other spell check popups when user opens new one", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            testingStore.dispatch(updateEditingTrack({ mediaTitle: "testingTrack" } as Track) as {} as AnyAction);
            const spellCheck = {
                matches: [
                    { offset: 5, length: 3, replacements: [] as Replacement[] },
                    { offset: 14, length: 5, replacements: [] as Replacement[] }
                ]
            } as SpellCheck;
            const vttCue = new VTTCue(0, 1, "some hTm <b>Text</b> smple");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor index={0} vttCue={vttCue} editUuid={editUuid} spellCheck={spellCheck} />
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
            testingStore.dispatch(updateEditingTrack({ mediaTitle: "testingTrack" } as Track) as {} as AnyAction);
            const spellCheck = {
                matches: [
                    { offset: 5, length: 3, replacements: [] as Replacement[] },
                    { offset: 14, length: 5, replacements: [] as Replacement[] }
                ]
            } as SpellCheck;
            const vttCue = new VTTCue(0, 1, "some hTm <b>Text</b> smple");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueTextEditor index={0} vttCue={vttCue} editUuid={editUuid} spellCheck={spellCheck} />
                </Provider>
            );
            actualNode.find(".sbte-text-with-error").at(0).simulate("click");
            actualNode.setProps({});

            // WHEN
            actualNode.find(".sbte-text-with-error").at(0).simulate("click");

            // THEN
            expect(actualNode.find(Overlay).at(0).props().show).toBeFalsy();
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
                "<span style=\"border: 1px solid rgb(75,0,130); background-color: rgb(230, 230, 250);\">" +
                "<span data-offset-key=\"\" style=\"font-weight: bold;\"><span data-text=\"true\">Text</span>" +
                "</span></span>";

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueTextEditor
                        index={0}
                        vttCue={vttCue}
                        editUuid={editUuid}
                        searchReplaceMatches={searchReplaceMatches}
                    />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.container.innerHTML)).toContain(expectedContent);
        });

        it("renders with html and search and replace results only one with many offsets", () => {
            // GIVEN
            const searchReplaceMatches = {
                offsets: [10, 22],
                offsetIndex: 1,
                matchLength: 4
            } as SearchReplaceMatches;
            const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b> sample Text");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const expectedContent =
                "<span style=\"border: 1px solid rgb(75,0,130); background-color: rgb(230, 230, 250);\">" +
                "<span data-offset-key=\"\"><span data-text=\"true\">Text</span>" +
                "</span></span>";

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueTextEditor
                        index={0}
                        vttCue={vttCue}
                        editUuid={editUuid}
                        searchReplaceMatches={searchReplaceMatches}
                    />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.container.innerHTML)).toContain(expectedContent);
        });

        it("replaces matched text with replacement when replaceCurrentMatch is called - multiple", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            testingStore.dispatch(updateEditingTrack({ mediaTitle: "testingTrack" } as Track) as {} as AnyAction);
            testingStore.dispatch(setReplacement("abcd efg") as {} as AnyAction);
            const searchReplaceMatches = {
                offsets: [10, 22],
                offsetIndex: 0,
                matchLength: 4
            } as SearchReplaceMatches;
            const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b> sample Text");
            const editUuid = testingStore.getState().cues[0].editUuid;
            render(
                <Provider store={testingStore}>
                    <CueTextEditor
                        index={0}
                        vttCue={vttCue}
                        editUuid={editUuid}
                        searchReplaceMatches={searchReplaceMatches}
                    />
                </Provider>
            );

            // WHEN
            act(() => {
                testingStore.dispatch(replaceCurrentMatch() as {} as AnyAction);
            });

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
            expect(testingStore.getState().cues[0].vttCue.text)
                .toEqual("some <i>HTML</i> <b>abcd efg</b> sample Text");
        });
    });
});
