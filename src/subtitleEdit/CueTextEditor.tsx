import React, {ReactElement, useEffect, useState} from "react";
import {updateCue} from "../player/trackSlices";
import {useDispatch} from "react-redux";
import {ContentState, Editor, EditorState, convertFromHTML, RichUtils} from "draft-js";
import {Options, stateToHTML} from "draft-js-export-html";

interface Props{
    index: number;
    cue: VTTCue;
}


// @ts-ignore
const convertToHtmlOptions = {
    inlineStyles: {
        BOLD: {element: "b"},
        ITALIC: {element: "i"},
    },
    defaultBlockTag: null
} as Options;

const CueTextEditor = (props: Props): ReactElement => {
    const processedHTML = convertFromHTML(props.cue.text);
    const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
    const [editorState, setEditorState] = useState(EditorState.createWithContent(contentState));
    const dispatch = useDispatch();
    useEffect(
        () => {
            const text = stateToHTML(editorState.getCurrentContent(), convertToHtmlOptions);
            dispatch(updateCue(props.index, new VTTCue(props.cue.startTime, props.cue.endTime, text)));
        },
        [ editorState, dispatch, props.cue.startTime, props.cue.endTime, props.index ]
    );
    return (
        <div>
            <Editor
                editorState={editorState}
                onChange={(editorState: EditorState): void => setEditorState(editorState)}
                spellCheck
            />
            <button onClick={(): void => setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"))}>
                <b>B</b>
            </button>
            <button onClick={(): void => setEditorState(RichUtils.toggleInlineStyle(editorState, "ITALIC"))}>
                <i>I</i>
            </button>
            <button onClick={(): void => setEditorState(RichUtils.toggleInlineStyle(editorState, "UNDERLINE"))}>
                <u>U</u>
            </button>
        </div>
    )
};

export default CueTextEditor;