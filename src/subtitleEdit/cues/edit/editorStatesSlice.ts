import { CueIndexAction, cuesSlice, validationErrorSlice } from "../cueSlices";
import { PayloadAction, createSlice, Slice } from "@reduxjs/toolkit";
import { AppThunk } from "../../subtitleEditReducers";
import { Dispatch } from "react";
import { EditorState, RichUtils } from "draft-js";
import { checkCharacterLimitation } from "../cueUtils";
import { getVttText } from "../cueTextConverter";

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

export const autoSaveSuccessSlice = createSlice({
    name: "autoSaveSuccessSlice",
    initialState: false,
    reducers: {
        setAutoSaveSuccess: (_state, action: PayloadAction<boolean>): boolean => action.payload
    }
});

export const pendingCueChangesSlice = createSlice({
    name: "pendingCueChangesSlice",
    initialState: false,
    reducers: {
        setPendingCueChanges: (_state, action: PayloadAction<boolean>): boolean => action.payload
    },
    extraReducers: {
        [cuesSlice.actions.updateCueCategory.type]: (): boolean => true,
        [cuesSlice.actions.deleteCue.type]: (): boolean => true,
        [cuesSlice.actions.applyShiftTime.type]: (): boolean => true,
        [autoSaveSuccessSlice.actions.setAutoSaveSuccess.type]: (): boolean => false
    }
});

export const updateEditorState = (editorId: number, newEditorState: EditorState): AppThunk =>
    (dispatch: Dispatch<PayloadAction<EditorStateAction | boolean>>, getState): void => {
        const subtitleSpecifications = getState().subtitleSpecifications;

        const editorStates = getState().editorStates;
        const vttText = getVttText(newEditorState.getCurrentContent());
        const currentEditorState = editorStates.get(editorId);

        let editorState = newEditorState;
        if (!checkCharacterLimitation(vttText, subtitleSpecifications) && currentEditorState) {
            dispatch(validationErrorSlice.actions.setValidationError(true));
            // Force creation of different EditorState instance, so that CueTextEditor re-renders with old content
            editorState = RichUtils.toggleCode(RichUtils.toggleCode(currentEditorState));
        }

        dispatch(editorStatesSlice.actions.updateEditorState({ editorId, editorState }));
    };

export const reset = (): AppThunk => (dispatch: Dispatch<PayloadAction<undefined>>): void =>
    dispatch(editorStatesSlice.actions.reset());

export const setAutoSaveSuccess = (success: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean>>): void => {
        dispatch(autoSaveSuccessSlice.actions.setAutoSaveSuccess(success));
    };
