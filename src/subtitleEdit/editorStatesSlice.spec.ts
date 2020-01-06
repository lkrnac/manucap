import {updateEditorState} from "./editorStatesSlice";
import testingStore from "../testUtils/testingStore";
import {ContentState, EditorState} from "draft-js";

describe("editorStatesSlice", () => {
    it("updates editor state for 'editor1' ID", () => {
        // GIVEN
        const contentState = ContentState.createFromText("editor1 text");
        const editorState = EditorState.createWithContent(contentState);

        // WHEN
        testingStore.dispatch(updateEditorState("editor1", editorState));

        // THEN
        // @ts-ignore Test would fail if it returns null
        expect(testingStore.getState().editorStates.get("editor1").getCurrentContent().getPlainText())
            .toEqual("editor1 text");
    });

    it("updates editor state for 'editor2' ID", () => {
        // GIVEN
        const contentState = ContentState.createFromText("editor2 text");
        const editorState = EditorState.createWithContent(contentState);

        // WHEN
        testingStore.dispatch(updateEditorState("editor2", editorState));

        // THEN
        // @ts-ignore Test would fail if it returns null
        expect(testingStore.getState().editorStates.get("editor2").getCurrentContent().getPlainText())
            .toEqual("editor2 text");
    });
});