import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "../reducers/subtitleEditReducers";
import { Dispatch } from "react";
import { EditorState } from "draft-js";

interface EditorStateAction {
    index: number;
    editorState: EditorState;
}

export const editorStatesSlice = createSlice({
    name: "editorStates",
    initialState: [] as EditorState[],
    reducers: {
        updateEditorState: (state: EditorState[], action: PayloadAction<EditorStateAction>): void => {
            state[action.payload.index] = action.payload.editorState;
        },
        reset: (): EditorState[] => []
    }
});

export const updateEditorState = (index: number, editorState: EditorState): AppThunk =>
    (dispatch: Dispatch<PayloadAction<EditorStateAction>>): void => {
        dispatch(editorStatesSlice.actions.updateEditorState({ index, editorState }));
    };

export const reset = (): AppThunk => (dispatch: Dispatch<PayloadAction<undefined>>): void =>
    dispatch(editorStatesSlice.actions.reset());
