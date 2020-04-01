import { CueIndexAction, cuesSlice } from "../cueSlices";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "../../subtitleEditReducers";
import { Dispatch } from "react";
import { EditorState, RichUtils } from "draft-js";
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
        updateEditorState: (state, action: PayloadAction<EditorStateAction>): void => {
            const vttText = getVttText(action.payload.editorState.getCurrentContent());
            const subtitleSpecifications = action.payload.subtitleSpecifications;
            const currentEditorState = state.get(action.payload.editorId);

            if (checkCharacterLimitation(vttText, subtitleSpecifications) || !currentEditorState) {
                state.set(action.payload.editorId, action.payload.editorState);
            } else {
                // Force creation of different EditorState instance, so that CueTextEditor re-renders with old content
                const editorStateWithDummyChange = RichUtils.toggleCode(RichUtils.toggleCode(currentEditorState));
                state.set(action.payload.editorId, editorStateWithDummyChange);
            }
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

export const setPendingCueChanges = (pending: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean>>): void => {
        dispatch(pendingCueChangesSlice.actions.setPendingCueChanges(pending));
    };

export const setAutoSaveSuccess = (success: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean>>): void => {
        dispatch(autoSaveSuccessSlice.actions.setAutoSaveSuccess(success));
    };
