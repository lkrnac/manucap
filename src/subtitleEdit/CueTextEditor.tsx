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
    useEffect(
        () => {
            const text = stateToHTML(editorState.getCurrentContent(), convertToHtmlOptions);
            dispatch(updateCue(props.index, new VTTCue(props.cue.startTime, props.cue.endTime, text)));
        },
        [ editorState, dispatch, props.cue.startTime, props.cue.endTime, props.index ]
    );
    return (
        <div>
            <div className="form-control sbte-form-control" style={{ height: "4em" }}>
                <Editor
                    editorState={editorState}
                    onChange={(editorState: EditorState): void => setEditorState(editorState)}
                    spellCheck
                />
            </div>
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