import React, {ReactElement, useEffect, useState} from "react";
import {updateCue} from "../player/trackSlices";
import {useDispatch} from "react-redux";
import {ContentState, Editor, EditorState, convertFromHTML, RichUtils} from "draft-js";
import {Options, stateToHTML} from "draft-js-export-html";

interface Props{
    index: number;
    cue: VTTCue;
}

// @ts-ignore Cast to Options is needed, because "@types/draft-js-export-html" library doesn't allow null
// defaultBlockTag, but it is allowed in their docs: https://www.npmjs.com/package/draft-js-export-html#defaultblocktag
// TODO: is this would be updated in types definition, we can remove this explicit cast + ts-ignore
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
    const currentContent = editorState.getCurrentContent();
    useEffect(
        () => {
            const text = stateToHTML(currentContent, convertToHtmlOptions);
            dispatch(updateCue(props.index, new VTTCue(props.cue.startTime, props.cue.endTime, text)));
        },
        [ currentContent, dispatch, props.cue.startTime, props.cue.endTime, props.index ]
    );
    return (
        <div className="sbte-cue-editor">
            <div className="form-control" style={{ height: "4em", borderRight: "none" }}>
                <Editor
                    editorState={editorState}
                    onChange={(editorState: EditorState): void => setEditorState(editorState)}
                    spellCheck
                />
            </div>
            <div className="sbte-left-border" style={{ paddingLeft: "10px", paddingTop: "5px", paddingBottom: "5px" }}>
                <button
                    style={{ marginRight: "5px "}}
                    className="btn btn-outline-secondary"
                    onClick={(): void => setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"))}
                >
                    <b>B</b>
                </button>
                <button
                    style={{ marginRight: "5px "}}
                    className="btn btn-outline-secondary"
                    onClick={(): void => setEditorState(RichUtils.toggleInlineStyle(editorState, "ITALIC"))}
                >
                    <i>I</i>
                </button>
                <button
                    className="btn btn-outline-secondary"
                    onClick={(): void => setEditorState(RichUtils.toggleInlineStyle(editorState, "UNDERLINE"))}
                >
                    <u>U</u>
                </button>
            </div>
        </div>
    )
};

export default CueTextEditor;