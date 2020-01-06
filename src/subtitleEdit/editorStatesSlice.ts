import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {EditorState} from "draft-js";
import {AppThunk} from "../reducers/subtitleEditReducers";
import {Dispatch} from "react";

interface EditorStateAction {
    editorId: string;
    editorState: EditorState;
}

export const editorStatesSlice = createSlice({
    name: "editorStates",
    initialState: new Map<string, EditorState>(),
    reducers: {
        updateEditorState: (state, action: PayloadAction<EditorStateAction>): Map<string, EditorState> =>
            state.set(action.payload.editorId, action.payload.editorState)
    }
});

export const updateEditorState = (editorId: string, editorState: EditorState): AppThunk =>
    (dispatch: Dispatch<PayloadAction<EditorStateAction>>): void => {
        dispatch(editorStatesSlice.actions.updateEditorState({ editorId, editorState }));
    };