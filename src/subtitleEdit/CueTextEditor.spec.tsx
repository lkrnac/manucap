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
    <div className="sbte-cue-editor" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
            className="sbte-bottom-border"
            style={{
                flexBasis: "25%",
                display: "flex",
                justifyContent: "flex-end",
                padding: "5px 10px 5px 10px"
            }}
        >
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
                paddingBottom: "5px"
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
            <CueTextEditor index={0} vttCue={vttCue} />
        </Provider>
    );
    const editorState = actualNode.find(Editor).props().editorState;
    const selectionState = editorState.getSelection();
    const newSelectionState = selectionState.set("focusOffset", 5) as SelectionState;

    // WHEN
    actualNode.find(Editor).props().onChange(EditorState.acceptSelection(editorState, newSelectionState));
    actualNode.find("button").at(buttonIndex).simulate("click");

    // THEN
    expect(testingStore.getState().cues[0].vttCue.text).toEqual(expectedText);
    const currentContent = testingStore.getState().editorStates.get(0).getCurrentContent();
    expect(stateToHTML(currentContent, convertToHtmlOptions)).toEqual(testingStore.getState().cues[0].vttCue.text);
};

const testForContentState = (contentState: ContentState, vttCue: VTTCue, expectedStateHtml: string): void => {
    const editorState = EditorState.createWithContent(contentState);
    const expectedNode = createExpectedNode(editorState);

    // WHEN
    const actualNode = mount(
        <Provider store={testingStore}>
            <CueTextEditor index={0} vttCue={vttCue} />
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
        testForContentState(contentState, vttCue, "<br>");
    });

    it("renders with text", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        const contentState = ContentState.createFromText(vttCue.text);

        testForContentState(contentState, vttCue, "someText");
    });

    it("renders with html", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b>");
        const processedHTML = convertFromHTML(vttCue.text);
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);

        testForContentState(contentState, vttCue, "some <i>HTML</i> <b>Text</b>");
    });

    it("updates cue in redux store when changed", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        const actualNode = mount(
            <Provider store={testingStore} >
                <CueTextEditor index={0} vttCue={vttCue} />
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
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Paste text to start: someText");
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
        const vttCue = new VTTCue(0, 1, "someText");
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor index={0} vttCue={vttCue} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-add-cue-button").simulate("click");

        // THEN
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("");
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
    });

    it("deletes cue when delete cue button is clicked", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor index={0} vttCue={vttCue} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-delete-cue-button").simulate("click");

        // THEN
        expect(testingStore.getState().cues.length).toEqual(0);
    });

    it("maintain cue styles when cue text is changes", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        vttCue.position = 60;
        vttCue.align = "end";
        const actualNode = mount(
            <Provider store={testingStore} >
                <CueTextEditor index={0} vttCue={vttCue} />
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
});
