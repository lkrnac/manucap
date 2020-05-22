import "../../../testUtils/initBrowserEnvironment";
import { ContentState, convertFromHTML, EditorState } from "draft-js";
import { AnyAction } from "@reduxjs/toolkit";
import InlineStyleButton from "./InlineStyleButton";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";
import { updateEditorState } from "./editorStatesSlice";
import _ from "lodash";
import { TooltipWrapper } from "../../TooltipWrapper";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { Track } from "../../model";

/**
 * On click actions are covered by CueTextEditor tests
 */
describe("InlineStyleButton", () => {
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
                <InlineStyleButton editorIndex={0} inlineStyle={"BOLD"} label={<b>B</b>} />
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

        testingStore.dispatch(updateEditorState(0, editorState) as {} as AnyAction);

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <InlineStyleButton editorIndex={0} inlineStyle={"BOLD"} label={<b>B</b>} />
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

        testingStore.dispatch(updateEditorState(0, editorState) as {} as AnyAction);

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <InlineStyleButton editorIndex={0} inlineStyle={"ITALIC"} label={<i>I</i>} />
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

        testingStore.dispatch(updateEditorState(0, editorState) as {} as AnyAction);

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <InlineStyleButton editorIndex={0} inlineStyle={"UNDERLINE"} label={<u>U</u>} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("it doesn't grab focus from text editor when clicked, so we can change inline style text written next", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <InlineStyleButton editorIndex={0} inlineStyle={"BOLD"} label={<b>B</b>} />
            </Provider>
        );
        const event = { preventDefault: jest.fn() };

        // WHEN
        actualNode.find(InlineStyleButton).simulate("mousedown", event);

        // THEN
        expect(event.preventDefault).toBeCalled();
    });

    it("calls saveTrack in redux store on button toggle ", () => {
        // GIVEN
        const processedHTML = convertFromHTML("<u>lala</u>");
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);

        testingStore.dispatch(updateEditorState(0, editorState) as {} as AnyAction);

        const saveTrack = jest.fn();
        // @ts-ignore
        jest.spyOn(_, "debounce").mockReturnValue(() => { saveTrack(); });
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <InlineStyleButton editorIndex={0} inlineStyle={"BOLD"} label={<b>B</b>} />
            </Provider>
        );

        // WHEN
        actualNode.find(InlineStyleButton).simulate("click");

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });

    it("renders overlay with text provided to InlineStyleButton", () => {
        //GIVEN
        const expectedText = "BOLD";
        const expectedToolTipId = "BOLD0";

        //WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <InlineStyleButton
                    editorIndex={0}
                    inlineStyle={expectedText}
                    label={<b>B</b>}
                />
            </Provider>
        );

        //THEN
        expect(actualNode.find(TooltipWrapper).props().text).toEqual(expectedText);
        expect(actualNode.find(TooltipWrapper).props().tooltipId).toEqual(expectedToolTipId);
    });
});
