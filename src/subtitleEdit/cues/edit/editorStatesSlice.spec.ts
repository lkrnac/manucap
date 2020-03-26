import "video.js"; // VTTCue definition
import { ContentState, EditorState } from "draft-js";
import { AnyAction } from "@reduxjs/toolkit";
import deepFreeze from "deep-freeze";
import testingStore from "../../../testUtils/testingStore";
import { setAutoSaveSuccess, setPendingCueChanges, updateEditorState } from "./editorStatesSlice";
import { applyShiftTime, deleteCue, updateCueCategory } from "../cueSlices";


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
