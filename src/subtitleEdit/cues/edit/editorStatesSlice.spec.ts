import "video.js"; // VTTCue definition
import { ContentState, EditorState } from "draft-js";
import { AnyAction } from "@reduxjs/toolkit";
import deepFreeze from "deep-freeze";
import { updateEditorState } from "./editorStatesSlice";
import { createTestingStore } from "../../../testUtils/testingStore";
import { SubtitleSpecification } from "../../toolbox/model";
import { readSubtitleSpecification } from "../../toolbox/subtitleSpecificationSlice";

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("editorStatesSlice", () => {
    beforeEach(() => testingStore = createTestingStore());
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
        const initialContentState = ContentState.createFromText("editor1 \n text");
        const initialEditorState = EditorState.createWithContent(initialContentState);
        const testingSubtitleSpecification = {
            enabled: true,
            maxLinesPerCaption: 2,
            maxCharactersPerLine: 30,
        } as SubtitleSpecification;
        testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
        testingStore.dispatch(updateEditorState(1, initialEditorState) as {} as AnyAction);
        const incorrectContentState = ContentState.createFromText("editor1 \n\n text");
        const incorrectEditorState = EditorState.createWithContent(incorrectContentState);

        // WHEN
        testingStore.dispatch(updateEditorState(1, incorrectEditorState) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().editorStates.get(1).getCurrentContent().getPlainText())
            .toEqual("editor1 \n text");
        expect(testingStore.getState().editorStates.get(1)).not.toEqual(initialEditorState);
        expect(testingStore.getState().validationError).toEqual(true);
    });

    it("does update editor state if subtitle specs limitations are not matched for old and new cue", () => {
        // GIVEN
        const initialContentState = ContentState.createFromText("editor1 \n\n text");
        const initialEditorState = EditorState.createWithContent(initialContentState);
        testingStore.dispatch(updateEditorState(1, initialEditorState) as {} as AnyAction);
        const testingSubtitleSpecification = {
            enabled: true,
            maxLinesPerCaption: 2,
            maxCharactersPerLine: 30,
        } as SubtitleSpecification;
        testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
        const incorrectContentState = ContentState.createFromText("changed editor1 \n\n text");
        const incorrectEditorState = EditorState.createWithContent(incorrectContentState);

        // WHEN
        testingStore.dispatch(updateEditorState(1, incorrectEditorState) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().editorStates.get(1).getCurrentContent().getPlainText())
            .toEqual("changed editor1 \n\n text");
        expect(testingStore.getState().editorStates.get(1)).not.toEqual(initialEditorState);
        expect(testingStore.getState().validationError).toEqual(false);
    });
});

