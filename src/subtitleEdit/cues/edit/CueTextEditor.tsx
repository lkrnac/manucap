import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { Character, KeyCombination } from "../../shortcutConstants";
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
import { constructCueValuesArray, copyNonConstructorProperties } from "../cueUtils";
import { convertHtmlToVtt, convertVttToHtml } from "../cueTextConverter";
import { useDispatch, useSelector } from "react-redux";
import CueLineCounts from "../CueLineCounts";
import InlineStyleButton from "./InlineStyleButton";
import Mousetrap from "mousetrap";
import { updateEditorState } from "./editorStatesSlice";
import {setPendingCueChanges, updateVttCue} from "../cueSlices";

const characterBindings = new Map<Character, string>();
characterBindings.set(Character.O_CHAR, "togglePlayPause");
characterBindings.set(Character.ARROW_LEFT, "seekBack");
characterBindings.set(Character.ARROW_RIGHT, "seekAhead");
characterBindings.set(Character.ARROW_UP, "setStartTime");
characterBindings.set(Character.ARROW_DOWN, "setEndTime");
characterBindings.set(Character.SLASH_CHAR, "toggleShortcutPopup");

const keyShortcutBindings = (e: React.KeyboardEvent<{}>): string | null => {
    const action = characterBindings.get(e.keyCode);
    if (e.shiftKey && (e.metaKey || e.altKey || e.ctrlKey) && action) {
        return action;
    }
    if ((!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey)) {
        if (e.keyCode === Character.ESCAPE) {
            return "closeEditor";
        } else if (e.keyCode === Character.ENTER) {
            return "closeEditorAndCreateIfLast";
        }
    }
    return getDefaultKeyBinding(e);
};

const mousetrapBindings = new Map<string, KeyCombination>();
mousetrapBindings.set("togglePlayPause", KeyCombination.MOD_SHIFT_O);
mousetrapBindings.set("seekBack", KeyCombination.MOD_SHIFT_LEFT);
mousetrapBindings.set("seekAhead", KeyCombination.MOD_SHIFT_RIGHT);
mousetrapBindings.set("setStartTime", KeyCombination.MOD_SHIFT_UP);
mousetrapBindings.set("setEndTime", KeyCombination.MOD_SHIFT_DOWN);
mousetrapBindings.set("toggleShortcutPopup", KeyCombination.MOD_SHIFT_SLASH);
mousetrapBindings.set("closeEditor", KeyCombination.ESCAPE);
mousetrapBindings.set("closeEditorAndCreateIfLast", KeyCombination.ENTER);

const handleKeyShortcut = (shortcut: string): DraftHandleValue => {
    const keyCombination = mousetrapBindings.get(shortcut);
    if (keyCombination) {
        Mousetrap.trigger(keyCombination);
        return "handled";
    }
    return "not-handled";
};

export interface CueTextEditorProps{
    index: number;
    vttCue: VTTCue;
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
            const vttCue = new VTTCue(props.vttCue.startTime, props.vttCue.endTime, convertHtmlToVtt(text));
            copyNonConstructorProperties(vttCue, props.vttCue);
            dispatch(updateVttCue(props.index, vttCue));
            dispatch(setPendingCueChanges(true));
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
                    onChange={(editorState: EditorState): AppThunk =>
                        dispatch(updateEditorState(props.index, editorState))}
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
