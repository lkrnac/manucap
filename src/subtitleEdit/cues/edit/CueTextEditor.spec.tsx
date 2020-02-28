import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { Character, KeyCombination } from "../../shortcutConstants";
import CueTextEditor, { CueTextEditorProps } from "./CueTextEditor";
import Draft, { ContentState, Editor, EditorState, SelectionState, convertFromHTML } from "draft-js";
import { Options, stateToHTML } from "draft-js-export-html";
import React, { ReactElement } from "react";
import { ReactWrapper, mount } from "enzyme";
import { Provider } from "react-redux";
import { Store } from "@reduxjs/toolkit";
import { createTestingStore } from "../../../testUtils/testingStore";
import each from "jest-each";
import { removeDraftJsDynamicValues } from "../../../testUtils/testUtils";
import { reset } from "./editorStatesSlice";

let testingStore = createTestingStore();

interface ReduxTestWrapperProps {
    store: Store;
    props: CueTextEditorProps;
}

const ReduxTestWrapper = (props: ReduxTestWrapperProps): ReactElement => (
    <Provider store={props.store}>
        <CueTextEditor
            index={props.props.index}
            vttCue={props.props.vttCue}
            hideAddButton={props.props.hideAddButton}
            hideDeleteButton={props.props.hideDeleteButton}
            cueCategory="DIALOGUE"
        />
    </Provider>
);

const createExpectedNode = (
    editorState: EditorState,
    duration: number,
    characters: number,
    words: number
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
                <span>CHARACTERS: <span className="sbte-green-text">{characters}</span>, </span>
                <span>WORDS: <span className="sbte-green-text">{words}</span></span>
            </div>
            <button className="btn btn-outline-secondary sbte-delete-cue-button">
                <i className="fas fa-trash-alt" />
            </button>
        </div>
        <div
            className="sbte-form-control sbte-bottom-border"
            style={{
                flexBasis: "50%",
                paddingLeft: "10px",
                paddingTop: "5px",
                paddingBottom: "5px",
                minHeight: "54px"
            }}
        >
            <Editor editorState={editorState} onChange={jest.fn} spellCheck />
        </div>
        <div
            style={{
                flexBasis: "25%",
                display: "flex",
                justifyContent: "space-between",
                padding: "5px 10px 5px 10px"
            }}
        >
            <div>
                <button style={{ marginRight: "5px " }} className="btn btn-outline-secondary"><b>B</b></button>
                <button style={{ marginRight: "5px " }} className="btn btn-outline-secondary"><i>I</i></button>
                <button style={{ marginRight: "5px " }} className="btn btn-outline-secondary"><u>U</u></button>
            </div>
            <button className="btn btn-outline-secondary sbte-add-cue-button"><b>+</b></button>
        </div>
    </div>
);

const createEditorNode = (text = "someText"): ReactWrapper => {
    const vttCue = new VTTCue(0, 1, text);
    const actualNode = mount(
        <Provider store={testingStore}>
            <CueTextEditor
                cueCategory="DIALOGUE"
                index={0}
                vttCue={vttCue}
                hideAddButton={false}
                hideDeleteButton={false}
            />
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
    const actualNode = mount(
        <Provider store={testingStore}>
            <CueTextEditor
                cueCategory="DIALOGUE"
                index={0}
                vttCue={vttCue}
                hideAddButton={false}
                hideDeleteButton={false}
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
    characters: number,
    words: number
): void => {
    let editorState = EditorState.createWithContent(contentState);
    editorState = EditorState.moveFocusToEnd(editorState);
    const expectedNode = createExpectedNode(editorState, duration, characters, words);

    // WHEN
    const actualNode = mount(
        <Provider store={testingStore}>
            <CueTextEditor
                cueCategory="DIALOGUE"
                index={0}
                vttCue={vttCue}
                hideAddButton={false}
                hideDeleteButton={false}
            />
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
        testingStore.dispatch(reset());
    });
    it("renders empty", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "");
        const contentState = ContentState.createFromText("");

        // NOTE: Following latest expectation is not configurable nature of draft-js-export-html.
        // See following line in their code
        // eslint-disable-next-line max-len
        // https://github.com/sstur/draft-js-utils/blob/fe6eb9853679e2040ca3ac7bf270156079ab35db/packages/draft-js-export-html/src/stateToHTML.js#L366
        testForContentState(contentState, vttCue, "<br>", 1, 0, 0);
    });

    it("renders with text", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        const contentState = ContentState.createFromText(vttCue.text);

        testForContentState(contentState, vttCue, "someText", 1, 8, 1);
    });

    it("renders with html", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b> sample");
        const processedHTML = convertFromHTML(vttCue.text);
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);

        testForContentState(contentState, vttCue, "some <i>HTML</i> <b>Text</b> sample", 1, 21, 4);
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
        testInlineStyle(new VTTCue(0, 1, "someText"), 1, "<b>someT</b>ext");
    });

    it("updated cue when italic inline style is used", () => {
        testInlineStyle(new VTTCue(0, 1, "someText"), 2, "<i>someT</i>ext");
    });

    it("updated cue when underline inline style is used", () => {
        testInlineStyle(new VTTCue(0, 1, "someText"), 3, "<u>someT</u>ext");
    });

    it("deletes cue when delete cue button is clicked", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor
                    cueCategory="DIALOGUE"
                    index={0}
                    vttCue={vttCue}
                    hideAddButton={false}
                    hideDeleteButton={false}
                />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-delete-cue-button").simulate("click");

        // THEN
        expect(testingStore.getState().cues.length).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("");
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3);
        expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
    });

    it("maintain cue styles when cue text changes", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.position = 60;
        vttCue.align = "end";
        const actualNode = mount(
            <Provider store={testingStore} >
                <CueTextEditor
                    cueCategory="DIALOGUE"
                    index={0}
                    vttCue={vttCue}
                    hideAddButton={false}
                    hideDeleteButton={false}
                />
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
        [KeyCombination.MOD_SHIFT_O, Character.O_CHAR, true, true, false],
        [KeyCombination.MOD_SHIFT_O, Character.O_CHAR, false, true, true],
        [KeyCombination.MOD_SHIFT_LEFT, Character.ARROW_LEFT, true, true, false],
        [KeyCombination.MOD_SHIFT_LEFT, Character.ARROW_LEFT, false, true, true],
        [KeyCombination.MOD_SHIFT_RIGHT, Character.ARROW_RIGHT, true, true, false],
        [KeyCombination.MOD_SHIFT_RIGHT, Character.ARROW_RIGHT, false, true, true],
        [KeyCombination.MOD_SHIFT_UP, Character.ARROW_UP, true, true, false],
        [KeyCombination.MOD_SHIFT_UP, Character.ARROW_UP, false, true, true],
        [KeyCombination.MOD_SHIFT_DOWN, Character.ARROW_DOWN, true, true, false],
        [KeyCombination.MOD_SHIFT_DOWN, Character.ARROW_DOWN, false, true, true],
        [KeyCombination.MOD_SHIFT_SLASH, Character.SLASH_CHAR, true, true, false],
        [KeyCombination.MOD_SHIFT_SLASH, Character.SLASH_CHAR, false, true, true],
    ])
    .it("should handle '%s' keyboard shortcut", (
        expectedKeyCombination: KeyCombination,
        character: Character, metaKey: boolean, shiftKey: boolean, altKey: boolean
    ) => {
        // GIVEN
        const mousetrapSpy = jest.spyOn(Mousetrap, "trigger");
        const editor = createEditorNode();

        // WHEN
        editor.simulate("keyDown", { keyCode: character, metaKey, shiftKey, altKey, });

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

    it("updates cue in Redux if position property is changed", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.position = 3;

        const actualNode = mount(
            <ReduxTestWrapper
                store={testingStore}
                props={{ index: 0, vttCue, hideAddButton: false, hideDeleteButton: false, cueCategory: "DIALOGUE" }}
            />
        );

        // WHEN
        vttCue.position = 6;
        actualNode.setProps({ props: { index: 0, vttCue }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.position).toEqual(6);
    });

    it("updates cue in Redux if align property is changed", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.align = "left";

        const actualNode = mount(
            <ReduxTestWrapper
                store={testingStore}
                props={{ index: 0, vttCue, hideAddButton: false, hideDeleteButton: false, cueCategory: "DIALOGUE" }}
            />
        );

        // WHEN
        vttCue.align = "right";
        actualNode.setProps({ props: { index: 0, vttCue }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.align).toEqual("right");
    });

    it("updates cue in Redux if lineAlign property is changed", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.lineAlign = "start";

        const actualNode = mount(
            <ReduxTestWrapper
                store={testingStore}
                props={{ index: 0, vttCue, hideAddButton: false, hideDeleteButton: false, cueCategory: "DIALOGUE" }}
            />
        );

        // WHEN
        vttCue.lineAlign = "end";
        actualNode.setProps({ props: { index: 0, vttCue }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.lineAlign).toEqual("end");
    });

    it("updates cue in Redux if positionAlign property is changed", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.positionAlign = "line-left";

        const actualNode = mount(
            <ReduxTestWrapper
                store={testingStore}
                props={{ index: 0, vttCue, hideAddButton: false, hideDeleteButton: false, cueCategory: "DIALOGUE" }}
            />
        );

        // WHEN
        vttCue.positionAlign = "line-right";
        actualNode.setProps({ props: { index: 0, vttCue }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.positionAlign).toEqual("line-right");
    });

    it("updates cue in Redux if snapToLines property is changed", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.snapToLines = false;

        const actualNode = mount(
            <ReduxTestWrapper
                store={testingStore}
                props={{ index: 0, vttCue, hideAddButton: false, hideDeleteButton: false, cueCategory: "DIALOGUE" }}
            />
        );

        // WHEN
        vttCue.snapToLines = true;
        actualNode.setProps({ props: { index: 0, vttCue }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.snapToLines).toEqual(true);
    });

    it("updates cue in Redux if size property is changed", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.size = 80;

        const actualNode = mount(
            <ReduxTestWrapper
                store={testingStore}
                props={{ index: 0, vttCue, hideAddButton: false, hideDeleteButton: false, cueCategory: "DIALOGUE" }}
            />
        );

        // WHEN
        vttCue.size = 30;
        actualNode.setProps({ props: { index: 0, vttCue }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.size).toEqual(30);
    });

    it("updates cue in Redux if line property is changed", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.line = 3;

        const actualNode = mount(
            <ReduxTestWrapper
                store={testingStore}
                props={{ index: 0, vttCue, hideAddButton: false, hideDeleteButton: false, cueCategory: "DIALOGUE" }}
            />
        );

        // WHEN
        vttCue.line = 6;
        actualNode.setProps({ props: { index: 0, vttCue }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.line).toEqual(6);
    });

    it("updates cue in Redux if vertical property is changed", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.vertical = "rl";

        const actualNode = mount(
            <ReduxTestWrapper
                store={testingStore}
                props={{ index: 0, vttCue, hideAddButton: false, hideDeleteButton: false, cueCategory: "DIALOGUE" }}
            />
        );

        // WHEN
        vttCue.vertical = "lr";
        actualNode.setProps({ props: { index: 0, vttCue }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.vertical).toEqual("lr");
    });

    it("updates cue in Redux if ID property is changed", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.id = "id";

        const actualNode = mount(
            <ReduxTestWrapper
                store={testingStore}
                props={{ index: 0, vttCue, hideAddButton: false, hideDeleteButton: false, cueCategory: "DIALOGUE" }}
            />
        );

        // WHEN
        vttCue.id = "differentId";
        actualNode.setProps({ props: { index: 0, vttCue }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.id).toEqual("differentId");
    });

    it("updates cue in Redux if pauseOnExit property is changed", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.pauseOnExit = false;

        const actualNode = mount(
            <ReduxTestWrapper
                store={testingStore}
                props={{ index: 0, vttCue, hideAddButton: false, hideDeleteButton: false, cueCategory: "DIALOGUE" }}
            />
        );

        // WHEN
        vttCue.pauseOnExit = true;
        actualNode.setProps({ props: { index: 0, vttCue }});

        // THEN
        expect(testingStore.getState().cues[0].vttCue.pauseOnExit).toEqual(true);
    });

    it("hides add cue button", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor
                    cueCategory="DIALOGUE"
                    index={0}
                    vttCue={vttCue}
                    hideAddButton
                    hideDeleteButton={false}
                />
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
                <CueTextEditor
                    cueCategory="DIALOGUE"
                    index={0}
                    vttCue={vttCue}
                    hideAddButton={false}
                    hideDeleteButton
                />
            </Provider>
        );

        // THEN
        expect(actualNode.find(".sbte-delete-cue-button")).toEqual({});
    });
});
