import "../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { ContentState, Editor, EditorState, SelectionState, convertFromHTML } from "draft-js";
import { Options, stateToHTML } from "draft-js-export-html";
import { ReactWrapper, mount } from "enzyme";
import CueTextEditor from "./CueTextEditor";
import { Provider } from "react-redux";
import React from "react";
import { createTestingStore } from "../testUtils/testingStore";
import { removeDraftJsDynamicValues } from "../testUtils/testUtils";
import { reset } from "./editorStatesSlice";

let testingStore = createTestingStore();

const createExpectedNode = (editorState: EditorState): ReactWrapper => mount(
    <div className="sbte-cue-editor">
        <div
            className="sbte-bottom-border"
            style={{ display: "flex", justifyContent: "flex-end", padding: "5px 10px 5px 10px" }}
        >
            <button className="btn btn-outline-secondary sbte-delete-cue-button">
                <i className="fas fa-trash-alt" />
            </button>
        </div>
        <div
            className="sbte-form-control sbte-bottom-border"
            style={{ height: "4em", paddingLeft: "10px", paddingTop: "5px", paddingBottom: "5px" }}
        >
            <Editor editorState={editorState} onChange={jest.fn} spellCheck />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 10px 5px 10px" }}>
            <div>
                <button style={{ marginRight: "5px " }} className="btn btn-outline-secondary"><b>B</b></button>
                <button style={{ marginRight: "5px " }} className="btn btn-outline-secondary"><i>I</i></button>
                <button style={{ marginRight: "5px " }} className="btn btn-outline-secondary"><u>U</u></button>
            </div>
            <button className="btn btn-outline-secondary sbte-add-cue-button"><b>+</b></button>
        </div>
    </div>
);

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

const testInlineStyle = (cue: VTTCue, buttonIndex: number, expectedText: string): void => {
    // GIVEN
    const actualNode = mount(
        <Provider store={testingStore}>
            <CueTextEditor index={0} cue={cue} />
        </Provider>
    );
    const editorState = actualNode.find(Editor).props().editorState;
    const selectionState = editorState.getSelection();
    const newSelectionState = selectionState.set("focusOffset", 5) as SelectionState;

    // WHEN
    actualNode.find(Editor).props().onChange(EditorState.acceptSelection(editorState, newSelectionState));
    actualNode.find("button").at(buttonIndex).simulate("click");

    // THEN
    expect(testingStore.getState().cues[0].text).toEqual(expectedText);
    const currentContent = testingStore.getState().editorStates.get(0).getCurrentContent();
    expect(stateToHTML(currentContent, convertToHtmlOptions)).toEqual(testingStore.getState().cues[0].text);
};

const testForContentState = (contentState: ContentState, cue: VTTCue, expectedStateHtml: string): void => {
    const editorState = EditorState.createWithContent(contentState);
    const expectedNode = createExpectedNode(editorState);

    // WHEN
    const actualNode = mount(
        <Provider store={testingStore}>
            <CueTextEditor index={0} cue={cue} />
        </Provider>
    );

    // THEN
    expect(removeDraftJsDynamicValues(actualNode.html())).toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    const currentContent = testingStore.getState().editorStates.get(0).getCurrentContent();
    expect(testingStore.getState().cues[0].text).toEqual(cue.text);
    expect(stateToHTML(currentContent, convertToHtmlOptions)).toEqual(expectedStateHtml);
};

describe("CueTextEditor", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(reset());
    });
    it("renders empty", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "");
        const contentState = ContentState.createFromText("");

        // NOTE: Following latest expectation is not configurable nature of draft-js-export-html.
        // See following line in their code
        // eslint-disable-next-line max-len
        // https://github.com/sstur/draft-js-utils/blob/fe6eb9853679e2040ca3ac7bf270156079ab35db/packages/draft-js-export-html/src/stateToHTML.js#L366
        testForContentState(contentState, cue, "<br>");
    });

    it("renders with text", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "someText");
        const contentState = ContentState.createFromText(cue.text);

        testForContentState(contentState, cue, "someText");
    });

    it("renders with html", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b>");
        const processedHTML = convertFromHTML(cue.text);
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);

        testForContentState(contentState, cue, "some <i>HTML</i> <b>Text</b>");
    });

    it("updates cue in redux store when changed", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "someText");
        const actualNode = mount(
            <Provider store={testingStore} >
                <CueTextEditor index={0} cue={cue} />
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
        expect(testingStore.getState().cues[0].text).toEqual("Paste text to start: someText");
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

    it("added cue when add cue button is clicked", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "someText");
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor index={0} cue={cue} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-add-cue-button").simulate("click");

        // THEN
        expect(testingStore.getState().cues[1].text).toEqual("");
        expect(testingStore.getState().cues[1].startTime).toEqual(1);
        expect(testingStore.getState().cues[1].endTime).toEqual(4);
    });

    it("deletes cue when delete cue button is clicked", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "someText");
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor index={0} cue={cue} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-delete-cue-button").simulate("click");

        // THEN
        expect(testingStore.getState().cues.length).toEqual(0);
    });

    it("maintain cue styles when cue text is changes", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "someText");
        cue.position = 60;
        cue.align = "end";
        const actualNode = mount(
            <Provider store={testingStore} >
                <CueTextEditor index={0} cue={cue} />
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
        expect(testingStore.getState().cues[0].position).toEqual(60);
        expect(testingStore.getState().cues[0].align).toEqual("end");
    });
});
