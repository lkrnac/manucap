import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {EditorState} from "draft-js";
import {AppThunk} from "../reducers/subtitleEditReducers";
import {Dispatch} from "react";

interface EditorStateAction {
    editorId: number;
    editorState: EditorState;
}

export const editorStatesSlice = createSlice({
    name: "editorStates",
    initialState: new Map<number, EditorState>(),
    reducers: {
        updateEditorState: (state, action: PayloadAction<EditorStateAction>): Map<number, EditorState> =>
            state.set(action.payload.editorId, action.payload.editorState),
        reset: (): Map<number, EditorState> => new Map<number, EditorState>()
    }
});

export const updateEditorState = (editorId: number, editorState: EditorState): AppThunk =>
    (dispatch: Dispatch<PayloadAction<EditorStateAction>>): void => {
        dispatch(editorStatesSlice.actions.updateEditorState({ editorId, editorState }));
    };

export const reset = (): AppThunk => (dispatch: Dispatch<PayloadAction<undefined>>): void =>
    dispatch(editorStatesSlice.actions.reset());
