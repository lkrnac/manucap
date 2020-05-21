import React, { ReactElement, useEffect, Dispatch, useState } from "react";
import { ContentState, convertFromHTML, DraftHandleValue, Editor, EditorState, getDefaultKeyBinding } from "draft-js";
import { useDispatch, useSelector } from "react-redux";
import Mousetrap from "mousetrap";
import _ from "lodash";

import { SubtitleEditState, AppThunk } from "../../subtitleEditReducers";
import { Character, getActionByKeyboardEvent, mousetrapBindings } from "../../shortcutConstants";
import { constructCueValuesArray, copyNonConstructorProperties } from "../cueUtils";
import { convertVttToHtml, getVttText } from "../cueTextConverter";
import CueLineCounts from "../CueLineCounts";
import InlineStyleButton from "./InlineStyleButton";
import { updateEditorState } from "./editorStatesSlice";
import { updateVttCue } from "../cueSlices";
import { callSaveTrack } from "../saveSlices";

const keyShortcutBindings = (e: React.KeyboardEvent<{}>): string | null => {
    const action = getActionByKeyboardEvent(e);
    if (action) {
        return action;
    }
    if ((!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey)) {
        if (e.keyCode === Character.ESCAPE) {
            return "closeEditor";
        } else if (e.keyCode === Character.ENTER) {
            return "editNext";
        }
    }
    return getDefaultKeyBinding(e);
};

const handleKeyShortcut = (shortcut: string): DraftHandleValue => {
    const keyCombination = mousetrapBindings.get(shortcut);
    if (keyCombination) {
        Mousetrap.trigger(keyCombination);
        return "handled";
    }
    return "not-handled";
};

export interface CueTextEditorProps {
    index: number;
    vttCue: VTTCue;
    editUuid?: string;
}

const changeVttCueInRedux = (
    currentContent: ContentState,
    props: CueTextEditorProps,
    dispatch: Dispatch<AppThunk>,
    textChanged: boolean,
    setTextChanged: (textChanged: boolean) => void
): void => {
    const vttText = getVttText(currentContent);
    const vttCue = new VTTCue(props.vttCue.startTime, props.vttCue.endTime, vttText);
    copyNonConstructorProperties(vttCue, props.vttCue);
    dispatch(updateVttCue(props.index, vttCue, props.editUuid));
    // this if is so we don't trigger a save on first render
    if (textChanged) {
        dispatch(callSaveTrack());
        setTextChanged(false);
    }
};

const changeVttCueInReduxDebounced = _.debounce(changeVttCueInRedux, 500);

const CueTextEditor = (props: CueTextEditorProps): ReactElement => {
    const dispatch = useDispatch();
    const processedHTML = convertFromHTML(convertVttToHtml(props.vttCue.text));
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
    const [textChanged, setTextChanged] = useState(false);
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
            changeVttCueInReduxDebounced(currentContent, props, dispatch, textChanged, setTextChanged);
        },
        // Two bullet points in this suppression:
        //  - props.vttCue is not included, because it causes endless FLUX loop.
        //  - spread operator for cue values is used so that all the VTTCue properties code can be in single file.
        // eslint-disable-next-line
        [ currentContent, currentInlineStyle, dispatch, props.index, ...constructCueValuesArray(props.vttCue) ]
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div
                className="sbte-bottom-border"
                style={{
                    flexBasis: "25%",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 10px 5px 10px"
                }}
            >
                <CueLineCounts cueIndex={props.index} vttCue={props.vttCue} />
            </div>
            <div
                className="sbte-form-control sbte-bottom-border"
                style={{
                    flexBasis: "50%",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px"
                }}
            >
                <Editor
                    editorState={editorState}
                    onChange={(newEditorState: EditorState): void => {
                        dispatch(updateEditorState(props.index, newEditorState));
                        if (editorState.getCurrentContent() !== newEditorState.getCurrentContent()) {
                            setTextChanged(true);
                        }
                    }}
                    spellCheck
                    keyBindingFn={keyShortcutBindings}
                    handleKeyCommand={handleKeyShortcut}
                />
            </div>
            <div style={{ flexBasis: "25%", padding: "5px 10px 5px 10px" }}>
                <InlineStyleButton editorIndex={props.index} inlineStyle="BOLD" label={<b>B</b>} />
                <InlineStyleButton editorIndex={props.index} inlineStyle="ITALIC" label={<i>I</i>} />
                <InlineStyleButton editorIndex={props.index} inlineStyle="UNDERLINE" label={<u>U</u>} />
            </div>
        </div>
    );
};

export default CueTextEditor;
