import { CueIndexAction, cuesSlice } from "../cueSlices";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "../../subtitleEditReducers";
import { Dispatch } from "react";
import { EditorState } from "draft-js";
import { checkCharacterLimitation } from "../cueUtils";
import { SubtitleSpecification } from "../../toolbox/model";
import { getVttText } from "../cueTextConverter";

interface EditorStateAction {
    editorId: number;
    editorState: EditorState;
    subtitleSpecifications: SubtitleSpecification | null;
}

export const editorStatesSlice = createSlice({
    name: "editorStates",
    initialState: new Map<number, EditorState>(),
    reducers: {
        updateEditorState: (state, action: PayloadAction<EditorStateAction>): Map<number, EditorState> => {
            const vttText = getVttText(action.payload.editorState.getCurrentContent());
            const subtitleSpecifications = action.payload.subtitleSpecifications;
            if (checkCharacterLimitation(vttText, subtitleSpecifications)) {
                return state.set(action.payload.editorId, action.payload.editorState);
            }
            return state;
        },
        reset: (): Map<number, EditorState> => new Map<number, EditorState>()
    },
    extraReducers: {
        [cuesSlice.actions.addCue.type]: (): Map<number, EditorState> => new Map<number, EditorState>(),
        [cuesSlice.actions.updateCues.type]: (): Map<number, EditorState> => new Map<number, EditorState>(),
        [cuesSlice.actions.deleteCue.type]:
            (state, action: PayloadAction<CueIndexAction>): void => {
                state.delete(action.payload.idx);
            }
    }
});

export const updateEditorState = (
    editorId: number,
    editorState: EditorState,
    subtitleSpecifications: SubtitleSpecification | null = null
): AppThunk =>
    (dispatch: Dispatch<PayloadAction<EditorStateAction>>): void => {
        dispatch(editorStatesSlice.actions.updateEditorState({ editorId, editorState, subtitleSpecifications }));
    };

export const reset = (): AppThunk => (dispatch: Dispatch<PayloadAction<undefined>>): void =>
    dispatch(editorStatesSlice.actions.reset());
