import "../testUtils/initBrowserEnvironment";
import React from "react";
import InlineStyleButton from "./InlineStyleButton";
import testingStore from "../testUtils/testingStore";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { ContentState, convertFromHTML, EditorState } from "draft-js";
import { updateEditorState } from "./editorStatesSlice";

describe("InlineStyleButton", () => {
    // On click concerns are covered by CueTextEditor tests

    it("renders for empty editor state", () => {
        // GIVEN
        const expectedNode = mount(
            <button style={{ marginRight: "5px" }} className="btn btn-outline-secondary">
                <b>B</b>
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <InlineStyleButton editorIndex={0} inlineStyle={"BOLD"} label={<b>B</b>}/>
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("toggle Bold button if editor's cursor is on bold text", () => {
        // GIVEN
        const expectedNode = mount(
            <button style={{ marginRight: "5px" }} className="btn btn-secondary">
                <b>B</b>
            </button>
        );
        const processedHTML = convertFromHTML("<b>lala</b>");
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);

        testingStore.dispatch(updateEditorState(0, editorState));

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <InlineStyleButton editorIndex={0} inlineStyle={"BOLD"} label={<b>B</b>}/>
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("toggle Italic button if editor's cursor is on italic text", () => {
        // GIVEN
        const expectedNode = mount(
            <button style={{ marginRight: "5px" }} className="btn btn-secondary">
                <i>I</i>
            </button>
        );
        const processedHTML = convertFromHTML("<i>lala</i>");
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);

        testingStore.dispatch(updateEditorState(0, editorState));

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <InlineStyleButton editorIndex={0} inlineStyle={"ITALIC"} label={<i>I</i>}/>
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("toggle Italic button if editor's cursor is on italic text", () => {
        // GIVEN
        const expectedNode = mount(
            <button style={{ marginRight: "5px" }} className="btn btn-secondary">
                <u>U</u>
            </button>
        );
        const processedHTML = convertFromHTML("<u>lala</u>");
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);

        testingStore.dispatch(updateEditorState(0, editorState));

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <InlineStyleButton editorIndex={0} inlineStyle={"UNDERLINE"} label={<u>U</u>}/>
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
});