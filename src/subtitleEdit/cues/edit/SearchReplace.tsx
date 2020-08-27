import React, {Dispatch, ReactElement, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    searchNextCues,
    searchPreviousCues,
    searchReplaceAll,
    setSearchReplace,
    showSearchReplace
} from "./searchReplaceSlices";
import {EditorState} from "draft-js";
import {AppThunk, SubtitleEditState} from "../../subtitleEditReducers";
import {updateEditorState} from "./editorStatesSlice";
import {callSaveTrack} from "../saveSlices";
import {replaceContent} from "./editUtils";

const replacementHandler = (
    editorState: EditorState,
    dispatch: Dispatch<AppThunk>,
    editorCueIndex: number,
    matchIndex: number | undefined,
    find: string,
    replacement: string): void => {
    if (!matchIndex) {
        return;
    }
    const start = matchIndex;
    const end = start + find.length;
    const newEditorState = replaceContent(editorState, replacement, start, end);
    dispatch(updateEditorState(editorCueIndex, newEditorState));
    dispatch(setSearchReplace(find, undefined));
    dispatch(callSaveTrack());
};

const SearchReplace = (): ReactElement | null => {
    const [findTerm, setFindTerm] = useState("");
    const [replacementTerm, setReplacementTerm] = useState("");
    const dispatch = useDispatch();
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const editorState = useSelector((state: SubtitleEditState) =>
        state.editorStates.get(editingCueIndex)) as EditorState;
    const searchReplace = useSelector((state: SubtitleEditState) => state.searchReplace);
    const searchReplaceVisible = useSelector((state: SubtitleEditState) => state.searchReplaceVisible);

    return searchReplaceVisible ? (
        <div style={{display: "flex", flexFlow: "row", marginBottom: "5px"}}>
            <input
                name="findTerm"
                type="text"
                value={findTerm}
                onChange={e => setFindTerm(e.target.value)}
            />
            <input
                name="replacementTerm"
                type="text"
                value={replacementTerm}
                onChange={e => setReplacementTerm(e.target.value)}
            />
            <button
                className="btn btn-secondary"
                type="button"
                style={{marginLeft: "5px"}}
                onClick={(): void => {
                    dispatch(searchNextCues(findTerm))
                }}
            >
                <i className="fa fa-arrow-down" />
            </button>
            <button
                className="btn btn-secondary"
                type="button"
                style={{marginLeft: "5px"}}
                onClick={(): void => {
                    dispatch(searchPreviousCues(findTerm))
                }}
            >
                <i className="fa fa-arrow-up" />
            </button>
            <button
                className="btn btn-secondary"
                type="button"
                style={{marginLeft: "5px"}}
                onClick={(): void => {
                    replacementHandler(
                        editorState,
                        dispatch,
                        editingCueIndex,
                        searchReplace?.lastCueTextMatchIndex,
                        findTerm,
                        replacementTerm
                    );
                }}
            >
                Replace
            </button>
            <button
                className="btn btn-secondary"
                type="button"
                style={{marginLeft: "5px"}}
                onClick={(): void => {
                    dispatch(searchReplaceAll(findTerm, replacementTerm));
                }}
            >
                Replace All
            </button>
            <span style={{flex: 1}} />
            <button
                className="btn btn-secondary"
                type="button"
                style={{marginLeft: "5px"}}
                onClick={(): void => {
                    dispatch(showSearchReplace(false));
                }}
            >
                Done
            </button>
        </div>
    ) : null;
};

export default SearchReplace;
