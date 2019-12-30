import "../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import React from "react";
import { mount } from "enzyme";
import CueTextEditor from "./CueTextEditor";
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";
import {ContentState, convertFromHTML, Editor, EditorState, SelectionState} from "draft-js";
import {removeDraftJsDynamicValues} from "../testUtils/testUtils";

const testInlineStyle = (cue: VTTCue, buttonIndex: number, expectedText: string): void => {
    // GIVEN
    const actualNode = mount(
        <Provider store={testingStore}>
            <CueTextEditor index={0} cue={cue}/>
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
};
describe("CueTextEditor", () => {
    it("renders empty", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "");
        const  editorState = EditorState.createEmpty();
        const expectedNode = mount(
            <Editor editorState={editorState} onChange={jest.fn} spellCheck/>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <CueTextEditor index={0} cue={cue}/>
            </Provider>
        );

        // THEN
        console.log(actualNode.html());
        expect(removeDraftJsDynamicValues(actualNode.html())).toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders with text", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "someText");
        const contentState = ContentState.createFromText(cue.text);
        const  editorState = EditorState.createWithContent(contentState);
        const expectedNode = mount(
            <Editor editorState={editorState} onChange={jest.fn} spellCheck/>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <CueTextEditor index={0} cue={cue}/>
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html())).toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders with html", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "<i>some</i> HTML <b>Text</b>");
        const processedHTML = convertFromHTML(cue.text);
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        const  editorState = EditorState.createWithContent(contentState);
        const expectedNode = mount(
            <Editor editorState={editorState} onChange={jest.fn} spellCheck/>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore} >
                <CueTextEditor index={0} cue={cue}/>
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html())).toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("updates cue in redux store when changed", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "someText");
        const actualNode = mount(
            <Provider store={testingStore} >
                <CueTextEditor index={0} cue={cue}/>
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
        testInlineStyle(new VTTCue(0, 1, "someText"), 0, "<p><b>someT</b>ext</p>");
    });

    it("updated cue when italic inline style is used", () => {
        testInlineStyle(new VTTCue(0, 1, "someText"), 1, "<p><i>someT</i>ext</p>");
    });

    it("updated cue when underline inline style is used", () => {
        testInlineStyle(new VTTCue(0, 1, "someText"), 2, "<p><u>someT</u>ext</p>");
    });
});
