import "video.js"; // VTTCue definition
import { ContentState, EditorState } from "draft-js";
import { AnyAction } from "@reduxjs/toolkit";
import deepFreeze from "deep-freeze";
import testingStore from "../../../testUtils/testingStore";
import { setAutoSaveSuccess, setPendingCueChanges, updateEditorState } from "./editorStatesSlice";
import { applyShiftTime, deleteCue, updateCueCategory } from "../cueSlices";
import { SubtitleSpecification } from "../../toolbox/model";
import { readSubtitleSpecification } from "../../toolbox/subtitleSpecificationSlice";

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
        const testingSubtitleSpecification = {
            enabled: true,
            maxLinesPerCaption: 2,
            maxCharactersPerLine: 30,
        } as SubtitleSpecification;
        testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
        testingStore.dispatch(updateEditorState(1, initialEditorState) as {} as AnyAction);
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

describe("autoSaveSuccessSlice", () => {
    it("sets the autoSave success flag to false", () => {
        // WHEN
        testingStore.dispatch(setAutoSaveSuccess(false) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().autoSaveSuccess).toEqual(false);
    });
    it("sets the autoSave success flag to true", () => {
        // WHEN
        testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().autoSaveSuccess).toEqual(true);
    });
});

describe("pendingCueChangesSlice", () => {
    it("sets the pendingCueChanges flag to false", () => {
        // WHEN
        testingStore.dispatch(setPendingCueChanges(false) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().pendingCueChanges).toEqual(false);
    });

    it("sets the pendingCueChanges flag to true", () => {
        // WHEN
        testingStore.dispatch(setPendingCueChanges(true) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().pendingCueChanges).toEqual(true);
    });
    it("sets the pendingCueChanges on cue category update", () => {
        // WHEN
        testingStore.dispatch(updateCueCategory(0, "ONSCREEN_TEXT") as {} as AnyAction);

        // THEN
        expect(testingStore.getState().pendingCueChanges).toEqual(true);
    });
    it("sets the pendingCueChanges on cue line delete", () => {
        // WHEN
        testingStore.dispatch(deleteCue(0) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().pendingCueChanges).toEqual(true);
    });
    it("sets the pendingCueChanges on shift time applied", () => {
        // WHEN
        testingStore.dispatch(applyShiftTime(1) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().pendingCueChanges).toEqual(true);
    });
    it("sets the pendingCueChanges on autoSave success flag set", () => {
        // WHEN
        testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().pendingCueChanges).toEqual(false);
    });
});
