import {EditorState, Modifier, SelectionState} from "draft-js";

export const replaceContent = (
    editorState: EditorState,
    replacement: string,
    start: number,
    end: number): EditorState => {
    let contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const replaceSelectionState = selectionState.set("anchorOffset", start).set("focusOffset", end) as SelectionState;
    const startKey = replaceSelectionState.getStartKey();
    const replaceBlock = contentState.getBlockForKey(startKey);
    const inlineStyle = replaceBlock.getInlineStyleAt(start);
    contentState = Modifier.replaceText(contentState, replaceSelectionState, replacement, inlineStyle);
    return EditorState.push(editorState, contentState, "change-block-data");
};
