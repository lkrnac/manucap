import { CueIndexAction, cuesSlice } from "../cuesList/cuesListSlices";
import { PayloadAction, createSlice, Slice } from "@reduxjs/toolkit";
import { AppThunk } from "../../subtitleEditReducers";
import { Dispatch } from "react";
import { EditorState, RichUtils } from "draft-js";
import { getVttText } from "./cueTextConverter";
import { checkLineLimitation } from "../cueVerifications";
import { validationErrorSlice } from "./cueEditorSlices";
import { CueError } from "../../model";
import { enableMapSet } from 'immer';

// Needed because Map is used in editorStatesSlice state
enableMapSet();

interface EditorStateAction {
    editorId: number;
    editorState: EditorState;
}

// TODO: type declaration is needed to workaround draft-js type issue.
//  https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43426
//  Can be removed once fixed.
/* eslint-disable @typescript-eslint/no-explicit-any */
export const editorStatesSlice: Slice<
        Map<number, EditorState>,
        {
            updateEditorState: (state: any, action: PayloadAction<EditorStateAction>) => void;
            reset: () => Map<number, EditorState>;
        }
    > = createSlice({
    name: "editorStates",
    initialState: new Map<number, EditorState>(),
    reducers: {
        updateEditorState: (state, action: PayloadAction<EditorStateAction>): void => {
            // @ts-ignore update to immutable 4.0.0 caused this, was not able to figure out the fix
            state.set(action.payload.editorId, action.payload.editorState);
        },
        reset: (): Map<number, EditorState> => new Map<number, EditorState>()
    },
    extraReducers: {
        [cuesSlice.actions.addCue.type]: (): Map<number, EditorState> => new Map<number, EditorState>(),
        [cuesSlice.actions.updateCues.type]: (): Map<number, EditorState> => new Map<number, EditorState>(),
        [cuesSlice.actions.deleteCue.type]:
            (state, action: PayloadAction<CueIndexAction>): void => {
                state.delete(action.payload.idx);
            },
        [cuesSlice.actions.mergeCues.type]: (): Map<number, EditorState> => new Map<number, EditorState>(),
    }
});
/* eslint-enable @typescript-eslint/no-explicit-any */

export const updateEditorState = (editorId: number, newEditorState: EditorState): AppThunk =>
    (dispatch: Dispatch<PayloadAction<EditorStateAction | CueError[]>>, getState): void => {
        const subtitleSpecifications = getState().subtitleSpecifications;

        const editorStates = getState().editorStates;
        const newVttText = getVttText(newEditorState.getCurrentContent());
        const currentEditorState = editorStates.get(editorId);

        const oldVttText = currentEditorState
            ? getVttText(currentEditorState.getCurrentContent())
            : "";

        let editorState = newEditorState;
        const isNewVttTextCharLimitationOk = checkLineLimitation(newVttText, subtitleSpecifications);
        const isOldVttTextCharLimitationOk = checkLineLimitation(oldVttText, subtitleSpecifications);

        if (currentEditorState
            && !isNewVttTextCharLimitationOk
            && isOldVttTextCharLimitationOk
        ) {
            dispatch(validationErrorSlice.actions.setValidationErrors([CueError.LINE_COUNT_EXCEEDED]));
            // Force creation of different EditorState instance, so that CueTextEditor re-renders with old content
            editorState = RichUtils.toggleCode(RichUtils.toggleCode(currentEditorState));
        }

        dispatch(editorStatesSlice.actions.updateEditorState({ editorId, editorState }));
    };

export const reset = (): AppThunk => (dispatch: Dispatch<PayloadAction<undefined>>): void =>
    dispatch(editorStatesSlice.actions.reset());
