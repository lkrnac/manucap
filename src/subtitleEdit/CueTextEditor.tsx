import { AppThunk, SubtitleEditState } from "../reducers/subtitleEditReducers";
import { ContentState, Editor, EditorState, convertFromHTML } from "draft-js";
import { Options, stateToHTML } from "draft-js-export-html";
import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import InlineStyleButton from "./InlineStyleButton";
import { updateCue } from "../player/trackSlices";
import { updateEditorState } from "./editorStatesSlice";

interface Props{
    index: number;
    cue: VTTCue;
}

// @ts-ignore Cast to Options is needed, because "@types/draft-js-export-html" library doesn't allow null
// defaultBlockTag, but it is allowed in their docs: https://www.npmjs.com/package/draft-js-export-html#defaultblocktag
// TODO: is this would be updated in types definition, we can remove this explicit cast + ts-ignore
const convertToHtmlOptions = {
    inlineStyles: {
        BOLD: { element: "b" },
        ITALIC: { element: "i" },
    },
    defaultBlockTag: null
} as Options;

const CueTextEditor = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const processedHTML = convertFromHTML(props.cue.text);
    let editorState = useSelector((state: SubtitleEditState) => state.editorStates.get(props.index)) as EditorState;
    if (!editorState) {
        const initialContentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        editorState = EditorState.createWithContent(initialContentState);
    }
    useEffect(
        () => {
            dispatch(updateEditorState(props.index, editorState));
        },
        // Following suppressThis is done in purpose, because we want to initialize state only for first render
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ dispatch, props.index ]
    );

    const currentContent = editorState.getCurrentContent();
    useEffect(
        () => {
            const text = !currentContent.hasText() ? "" : stateToHTML(currentContent, convertToHtmlOptions);
            dispatch(updateCue(props.index, new VTTCue(props.cue.startTime, props.cue.endTime, text)));
        },
        [ currentContent, dispatch, props.cue.startTime, props.cue.endTime, props.index ]
    );
    return (
        <div className="sbte-cue-editor">
            <div className="form-control" style={{ height: "4em", borderRight: "none" }}>
                <Editor
                    editorState={editorState}
                    onChange={(editorState: EditorState): AppThunk =>
                        dispatch(updateEditorState(props.index, editorState))}
                    spellCheck
                />
            </div>
            <div className="sbte-left-border" style={{ paddingLeft: "10px", paddingTop: "5px", paddingBottom: "5px" }}>
                <InlineStyleButton editorIndex={props.index} inlineStyle="BOLD" label={<b>B</b>}/>
                <InlineStyleButton editorIndex={props.index} inlineStyle="ITALIC" label={<i>I</i>}/>
                <InlineStyleButton editorIndex={props.index} inlineStyle="UNDERLINE" label={<u>U</u>}/>
            </div>
        </div>
    );
};

export default CueTextEditor;