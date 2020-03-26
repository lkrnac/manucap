import { ContentState, EditorState } from "draft-js";
import { AnyAction } from "@reduxjs/toolkit";
import deepFreeze from "deep-freeze";
import testingStore from "../../../testUtils/testingStore";
import { updateEditorState } from "./editorStatesSlice";
import { SubtitleSpecification } from "../../toolbox/model";


deepFreeze(testingStore.getState());

describe("editorStatesSlice", () => {
    it("updates editor state for ID 1", () => {
        // GIVEN
        const contentState = ContentState.createFromText("editor1 text");
        const editorState = EditorState.createWithContent(contentState);

        // WHEN
        testingStore.dispatch(updateEditorState(1, editorState) as {} as AnyAction);

        // THEN
        // @ts-ignore Test would fail if it returns null
        expect(testingStore.getState().editorStates.get(1).getCurrentContent().getPlainText()).toEqual("editor1 text");
    });

    it("updates editor state for editor ID 2", () => {
        // GIVEN
        const contentState = ContentState.createFromText("editor2 text");
        const editorState = EditorState.createWithContent(contentState);

        // WHEN
        testingStore.dispatch(updateEditorState(2, editorState) as {} as AnyAction);

        // THEN
        // @ts-ignore Test would fail if it returns null
        expect(testingStore.getState().editorStates.get(2).getCurrentContent().getPlainText()).toEqual("editor2 text");
    });

    it("doesn't updates editor state if subtitle specs limitations are not matched", () => {
        // GIVEN
        const contentState = ContentState.createFromText("editor1 \n\n text");
        const editorState = EditorState.createWithContent(contentState);
        const testingSubtitleSpecification = {
            maxLinesPerCaption: 2,
            maxCharactersPerLine: 30,
        } as SubtitleSpecification;

        // WHEN
        testingStore.dispatch(updateEditorState(1, editorState, testingSubtitleSpecification) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().editorStates.get(1)).toBeUndefined();
    });
});
