import { CueIndexAction, cuesSlice } from "../../trackSlices";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "../../subtitleEditReducers";
import { Dispatch } from "react";
import { EditorState } from "draft-js";

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
    },
    extraReducers: {
        [cuesSlice.actions.addCue.type]: (): Map<number, EditorState> => new Map<number, EditorState>(),
        [cuesSlice.actions.deleteCue.type]:
            (state, action: PayloadAction<CueIndexAction>): void => {
                state.delete(action.payload.idx);
            }
    }
});

export const updateEditorState = (editorId: number, editorState: EditorState): AppThunk =>
    (dispatch: Dispatch<PayloadAction<EditorStateAction>>): void => {
        dispatch(editorStatesSlice.actions.updateEditorState({ editorId, editorState }));
    };

export const reset = (): AppThunk => (dispatch: Dispatch<PayloadAction<undefined>>): void =>
    dispatch(editorStatesSlice.actions.reset());
