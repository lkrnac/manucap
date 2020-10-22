import { CueIndexAction, cuesSlice } from "../cuesListSlices";
import { PayloadAction, createSlice, Slice } from "@reduxjs/toolkit";
import { AppThunk } from "../../subtitleEditReducers";
import { Dispatch } from "react";
import { EditorState, RichUtils } from "draft-js";
import { getVttText } from "../cueTextConverter";
import { checkCharacterAndLineLimitation, checkLineLimitation } from "../cueVerifications";
import { validationErrorSlice } from "./cueEditorSlices";

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
            }
    }
});
/* eslint-enable @typescript-eslint/no-explicit-any */

export const updateEditorState = (editorId: number, newEditorState: EditorState): AppThunk =>
    (dispatch: Dispatch<PayloadAction<EditorStateAction | boolean>>, getState): void => {
        const subtitleSpecifications = getState().subtitleSpecifications;

        const editorStates = getState().editorStates;
        const vttText = getVttText(newEditorState.getCurrentContent());
        const currentEditorState = editorStates.get(editorId);
        const currentVttText = currentEditorState
            ? getVttText(currentEditorState.getCurrentContent())
            : null;

        let editorState = newEditorState;
        if (!checkCharacterAndLineLimitation(vttText, subtitleSpecifications)
            && currentEditorState
            && currentVttText
            && checkLineLimitation(currentVttText, subtitleSpecifications)
        ) {
            dispatch(validationErrorSlice.actions.setValidationError(true));
            if (!checkLineLimitation(vttText, subtitleSpecifications)) {
                // Force creation of different EditorState instance, so that CueTextEditor re-renders with old content
                editorState = RichUtils.toggleCode(RichUtils.toggleCode(currentEditorState));
            }
        }

        dispatch(editorStatesSlice.actions.updateEditorState({ editorId, editorState }));
    };

export const reset = (): AppThunk => (dispatch: Dispatch<PayloadAction<undefined>>): void =>
    dispatch(editorStatesSlice.actions.reset());
