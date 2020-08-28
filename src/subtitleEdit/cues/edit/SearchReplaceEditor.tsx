import React, { Dispatch, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    searchNextCues,
    searchPreviousCues,
    searchReplaceAll, setFind, setReplacement,
    showSearchReplace
} from "./searchReplaceSlices";
import { EditorState } from "draft-js";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { updateEditorState } from "./editorStatesSlice";
import { callSaveTrack } from "../saveSlices";
import { replaceContent } from "./editUtils";
import { SearchReplace } from "../../model";

const replacementHandler = (
    editorState: EditorState,
    dispatch: Dispatch<AppThunk>,
    editorCueIndex: number,
    searchReplace: SearchReplace): void => {
    if (!searchReplace.lastCueTextMatchIndex || !searchReplace.replacement) {
        return;
    }
    const start = searchReplace.lastCueTextMatchIndex;
    const end = start + searchReplace.find.length;
    const newEditorState = replaceContent(editorState, searchReplace.replacement, start, end);
    dispatch(updateEditorState(editorCueIndex, newEditorState));
    dispatch(callSaveTrack());
    dispatch(searchNextCues());
};

const SearchReplaceEditor = (): ReactElement | null => {
    const dispatch = useDispatch();
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const editorState = useSelector((state: SubtitleEditState) =>
        state.editorStates.get(editingCueIndex)) as EditorState;
    const searchReplace = useSelector((state: SubtitleEditState) => state.searchReplace);
    const searchReplaceVisible = useSelector((state: SubtitleEditState) => state.searchReplaceVisible);

    return searchReplaceVisible ? (
        <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
            <div style={{display: "flex", flexFlow: "row", width: "50%"}}>
                <input
                    type="text"
                    value={searchReplace?.find}
                    placeholder="Find"
                    className="form-control"
                    onChange={e => dispatch(setFind(e.target.value))}
                />
                <input
                    type="text"
                    value={searchReplace?.replacement}
                    placeholder="Replace"
                    className="form-control"
                    style={{marginLeft: "5px"}}
                    onChange={e => dispatch(setReplacement(e.target.value))}
                />
            </div>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                onClick={(): void => {
                    dispatch(searchNextCues());
                }}
            >
                <i className="fa fa-arrow-down" />
            </button>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                onClick={(): void => {
                    dispatch(searchPreviousCues());
                }}
            >
                <i className="fa fa-arrow-up" />
            </button>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                onClick={(): void => {
                    replacementHandler(
                        editorState,
                        dispatch,
                        editingCueIndex,
                        searchReplace
                    );
                }}
            >
                Replace
            </button>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                onClick={(): void => {
                    if (!searchReplace.replacement) {
                        return;
                    }
                    dispatch(searchReplaceAll());
                }}
            >
                Replace All
            </button>
            <span style={{ flex: 1 }} />
            <button
                className="btn btn-secondary btn-sm sbte-close-search-replace-btn"
                type="button"
                style={{ marginLeft: "5px" }}
                onClick={(): void => {
                    dispatch(showSearchReplace(false));
                }}
            >
                <i className="fa fa-window-close" />
            </button>
        </div>
    ) : null;
};

export default SearchReplaceEditor;
