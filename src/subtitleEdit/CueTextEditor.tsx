import { AppThunk, SubtitleEditState } from "../reducers/subtitleEditReducers";
import { ContentState, Editor, EditorState, convertFromHTML } from "draft-js";
import { Options, stateToHTML } from "draft-js-export-html";
import React, { ReactElement, useEffect } from "react";
import { constructCueValuesArray, copyNonConstructorProperties } from "./cueUtils";
import { useDispatch, useSelector } from "react-redux";
import AddCueLineButton from "./AddCueLineButton";
import { CueCategory } from "../player/model";
import DeleteCueLineButton from "./DeleteCueLineButton";
import InlineStyleButton from "./InlineStyleButton";
import { updateEditorState } from "./editorStatesSlice";
import { updateVttCue } from "../player/trackSlices";

export interface CueTextEditorProps{
    index: number;
    vttCue: VTTCue;
    cueCategory?: CueCategory;
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

const CueTextEditor = (props: CueTextEditorProps): ReactElement => {
    const dispatch = useDispatch();
    const processedHTML = convertFromHTML(props.vttCue.text);
    let editorState = useSelector(
        (state: SubtitleEditState) => state.editorStates.get(props.index) as EditorState,
        ((left: EditorState) => !left) // don't re-render if previous editorState is defined -> delete action
    );
    if (!editorState) {
        const initialContentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        editorState = EditorState.createWithContent(initialContentState);
        editorState = EditorState.moveFocusToEnd(editorState);
    }
    const currentContent = editorState.getCurrentContent();
    const currentInlineStyle = editorState.getCurrentInlineStyle();
    useEffect(
        () => {
            dispatch(updateEditorState(props.index, editorState));
        },
        // It is enough to detect changes on pieces of editor state that indicate content change.
        // E.g. editorState.getSelection() is not changing content, thus we don't need to store editor state
        // into redux when changed.
        // (Also some tests would fail if you include editorState object itself, but behavior is still OK)
        // eslint-disable-next-line
        [ currentContent, currentInlineStyle, dispatch, props.index ]
    );

    useEffect(
        () => {
            const text = !currentContent.hasText() ? "" : stateToHTML(currentContent, convertToHtmlOptions);
            const vttCue = new VTTCue(props.vttCue.startTime, props.vttCue.endTime, text);
            copyNonConstructorProperties(vttCue, props.vttCue);
            dispatch(updateVttCue(props.index, vttCue));
        },
        // Two bullet points in this suppression:
        //  - props.vttCue is not included, because it causes endless FLUX loop.
        //  - spread operator for cue values is used so that all the VTTCue properties code can be in single file.
        // eslint-disable-next-line
        [ currentContent, currentInlineStyle, dispatch, props.index, ...constructCueValuesArray(props.vttCue) ]
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
                <AddCueLineButton
                    cueIndex={props.index}
                    vttCue={props.vttCue}
                    cueCategory={props.cueCategory}
                />
            </div>
        </div>
    );
};

export default CueTextEditor;
