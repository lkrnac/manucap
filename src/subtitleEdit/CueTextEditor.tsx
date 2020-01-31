import * as shortcuts from "../utils/shortcutConstants";
import { AppThunk, SubtitleEditState } from "../reducers/subtitleEditReducers";
import {
    ContentState,
    DraftHandleValue,
    Editor,
    EditorState,
    convertFromHTML,
    getDefaultKeyBinding
} from "draft-js";
import { Options, stateToHTML } from "draft-js-export-html";
import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddCueLineButton from "./AddCueLineButton";
import { CueCategory } from "../player/model";
import DeleteCueLineButton from "./DeleteCueLineButton";
import InlineStyleButton from "./InlineStyleButton";
import Mousetrap from "mousetrap";
import { copyNonConstructorProperties } from "./cueUtils";
import { updateEditorState } from "./editorStatesSlice";
import { updateVttCue } from "../player/trackSlices";

interface Props{
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

const CueTextEditor = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const processedHTML = convertFromHTML(props.vttCue.text);
    let editorState = useSelector((state: SubtitleEditState) => state.editorStates.get(props.index)) as EditorState;
    if (!editorState) {
        const initialContentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        editorState = EditorState.createWithContent(initialContentState);
        editorState = EditorState.moveFocusToEnd(editorState);
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
            const vttCue = new VTTCue(props.vttCue.startTime, props.vttCue.endTime, text);
            copyNonConstructorProperties(vttCue, props.vttCue);
            dispatch(updateVttCue(props.index, vttCue));
        },
        // ESLint suppress: copyNonConstructorProperties doesn't create side effect, just copies props from old vttCue.
        // If props.vttCue would be included, it creates endless FLUX loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ currentContent, dispatch, props.vttCue.startTime, props.vttCue.endTime, props.index ]
    );

    const keyShortcutBindings = (e: React.KeyboardEvent<{}>): string | null => {
        if (e.shiftKey && (e.metaKey || e.altKey)) {
            switch (e.keyCode) {
                case shortcuts.O_CHAR:
                    return "togglePlayPause";
                case shortcuts.ARROW_LEFT:
                    return "seekBack";
                case shortcuts.ARROW_RIGHT:
                    return "seekAhead";
                case shortcuts.ARROW_UP:
                    return "setStartTime";
                case shortcuts.ARROW_DOWN:
                    return "setEndTime";
                case shortcuts.SLASH_CHAR:
                    return "toggleShortcutPopup";
            }
        }
        return getDefaultKeyBinding(e);
    };
    const handleKeyShortcut = (shortcut: string): DraftHandleValue => {
        switch (shortcut) {
            case "togglePlayPause":
                Mousetrap.trigger(shortcuts.MOD_SHIFT_O);
                return "handled";
            case "seekBack":
                Mousetrap.trigger(shortcuts.MOD_SHIFT_LEFT);
                return "handled";
            case "seekAhead":
                Mousetrap.trigger(shortcuts.MOD_SHIFT_RIGHT);
                return "handled";
            case "setStartTime":
                Mousetrap.trigger(shortcuts.MOD_SHIFT_UP);
                return "handled";
            case "setEndTime":
                Mousetrap.trigger(shortcuts.MOD_SHIFT_DOWN);
                return "handled";
            case "toggleShortcutPopup":
                Mousetrap.trigger(shortcuts.MOD_SHIFT_SLASH);
                return "handled";
            default:
                return "not-handled";
        }
    };

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
                    keyBindingFn={keyShortcutBindings}
                    handleKeyCommand={handleKeyShortcut}
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
