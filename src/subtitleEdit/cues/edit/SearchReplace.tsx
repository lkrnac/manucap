import React, {Dispatch, ReactElement, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {searchNextCues, searchPreviousCues, searchReplaceAll, setSearchReplace} from "./searchReplaceSlices";
import {EditorState, Modifier, SelectionState} from "draft-js";
import {AppThunk, SubtitleEditState} from "../../subtitleEditReducers";
import {updateEditorState} from "./editorStatesSlice";
import {callSaveTrack} from "../saveSlices";

const replacementHandler = (
    editorState: EditorState,
    dispatch: Dispatch<AppThunk>,
    editorIndex: number,
    find: string,
    replacement: string): void => {
    let contentState = editorState.getCurrentContent();
    const text = contentState.getPlainText();
    const start = text.indexOf(find);
    const end = start + find.length;
    const selectionState = editorState.getSelection();
    const typoSelectionState = selectionState.set("anchorOffset", start).set("focusOffset", end) as SelectionState;
    const startKey = typoSelectionState.getStartKey();
    const replacementBlock = contentState.getBlockForKey(startKey);
    const inlineStyle = replacementBlock.getInlineStyleAt(start);
    contentState = Modifier.replaceText(contentState, typoSelectionState, replacement, inlineStyle);
    const newEditorState = EditorState.push(editorState, contentState, "change-block-data");
    dispatch(updateEditorState(editorIndex, newEditorState));
    dispatch(setSearchReplace(find, undefined));
    dispatch(callSaveTrack());
};

const SearchReplace = (): ReactElement => {
    const [findTerm, setFindTerm] = useState("");
    const [replacementTerm, setReplacementTerm] = useState("");
    const dispatch = useDispatch();
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const editorState = useSelector((state: SubtitleEditState) =>
        state.editorStates.get(editingCueIndex)) as EditorState;

    return (
        <div style={{display: "flex", flexFlow: "row"}}>
            <input
                name="findTerm"
                type="text"
                value={findTerm}
                // @ts-ignore
                onChange={e => setFindTerm(e.target.value)}
            />
            <input
                name="replacementTerm"
                type="text"
                value={replacementTerm}
                // @ts-ignore
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
                    replacementHandler(editorState, dispatch, editingCueIndex, findTerm, replacementTerm);
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
        </div>
    );
};

export default SearchReplace;
