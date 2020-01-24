import { AppThunk, SubtitleEditState } from "../reducers/subtitleEditReducers";
import { ContentState, Editor, EditorState, convertFromHTML } from "draft-js";
import { Options, stateToHTML } from "draft-js-export-html";
import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddCueLineButton from "./AddCueLineButton";
import DeleteCueLineButton from "./DeleteCueLineButton";
import InlineStyleButton from "./InlineStyleButton";
import { copyNonConstructorProperties } from "./cueUtils";
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
        // ESLint suppress: because we want to initialize state only for first render
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ dispatch, props.index ]
    );

    const currentContent = editorState.getCurrentContent();
    useEffect(
        () => {
            const text = !currentContent.hasText() ? "" : stateToHTML(currentContent, convertToHtmlOptions);
            const vttCue = new VTTCue(props.cue.startTime, props.cue.endTime, text);
            copyNonConstructorProperties(vttCue, props.cue);
            dispatch(updateCue(props.index, vttCue));
        },
        // ESLint suppress: copyNonConstructorProperties doesn't create side effect, just copies props from old cue.
        // If props.cue would be included, it creates endless FLUX loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ currentContent, dispatch, props.cue.startTime, props.cue.endTime, props.index ]
    );
    return (
        <div className="sbte-cue-editor" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div
                className="sbte-bottom-border"
                style={{
                    flexBasis: "25%",
                    display: "flex",
                    justifyContent: "flex-end",
                    padding: "5px 10px 5px 10px"
                }}
            >
                <DeleteCueLineButton cueIndex={props.index} />
            </div>
            <div
                className="sbte-form-control sbte-bottom-border"
                style={{
                    flexBasis: "50%",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px"
                }}
            >
                <Editor
                    editorState={editorState}
                    onChange={(editorState: EditorState): AppThunk =>
                        dispatch(updateEditorState(props.index, editorState))}
                    spellCheck
                />
            </div>
            <div
                style={{
                    flexBasis: "25%",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 10px 5px 10px"
                }}
            >
                <div>
                    <InlineStyleButton editorIndex={props.index} inlineStyle="BOLD" label={<b>B</b>} />
                    <InlineStyleButton editorIndex={props.index} inlineStyle="ITALIC" label={<i>I</i>} />
                    <InlineStyleButton editorIndex={props.index} inlineStyle="UNDERLINE" label={<u>U</u>} />
                </div>
                <AddCueLineButton cueIndex={props.index} cueEndTime={props.cue.endTime} />
            </div>
        </div>
    );
};

export default CueTextEditor;
