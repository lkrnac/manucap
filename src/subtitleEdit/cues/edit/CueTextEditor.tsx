import React, { Dispatch, ReactElement, useEffect, useRef, useState } from "react";
import {
    CompositeDecorator,
    ContentBlock,
    ContentState,
    convertFromHTML,
    DraftHandleValue,
    Editor,
    EditorState,
    getDefaultKeyBinding,
    Modifier,
    RichUtils,
    SelectionState,
} from "draft-js";
import { useDispatch, useSelector } from "react-redux";
import Mousetrap from "mousetrap";
import _ from "lodash";

import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { Character, getActionByKeyboardEvent, mousetrapBindings } from "../../shortcutConstants";
import { constructCueValuesArray, copyNonConstructorProperties } from "../cueUtils";
import { convertVttToHtml, getVttText } from "../cueTextConverter";
import CueLineCounts from "../CueLineCounts";
import InlineStyleButton from "./InlineStyleButton";
import { updateEditorState } from "./editorStatesSlice";
import { updateVttCue } from "../cueSlices";
import { SpellCheck } from "../spellCheck/model";
import { SpellCheckIssue } from "../spellCheck/SpellCheckIssue";
import { callSaveTrack } from "../saveSlices";

const handleKeyShortcut = (
    editorState: EditorState, dispatch: Dispatch<AppThunk>, props: CueTextEditorProps,
    spellCheckerMatchingOffset: number | null,
    setSpellCheckerMatchingOffset: Function,
) => (shortcut: string): DraftHandleValue => {
    const keyCombination = mousetrapBindings.get(shortcut);
    if (shortcut === "openSpellChecker") {
        const selection = editorState.getSelection();
        const startOffset = selection.getStartOffset();
        const match = props.spellCheck?.matches.find(match => match.offset <= startOffset &&
            startOffset <= (match.offset + match.length));
        if (match != null) {
            setSpellCheckerMatchingOffset(spellCheckerMatchingOffset != null ? null : match.offset);
        }
        return "handled";
    }
    if (keyCombination) {
        Mousetrap.trigger(keyCombination);
        return "handled";
    }
    if (shortcut === "newLine") {
        const newEditorState = RichUtils.insertSoftNewline(editorState);
        dispatch(updateEditorState(props.index, newEditorState));
        return "handled";
    }
    return "not-handled";
};

export interface CueTextEditorProps {
    index: number;
    vttCue: VTTCue;
    editUuid?: string;
    spellCheck?: SpellCheck;
    bindCueViewModeKeyboardShortcut: () => void;
}

const changeVttCueInRedux = (
    currentContent: ContentState,
    props: CueTextEditorProps,
    dispatch: Dispatch<AppThunk>,
): void => {
    const vttText = getVttText(currentContent);
    const vttCue = new VTTCue(props.vttCue.startTime, props.vttCue.endTime, vttText);
    copyNonConstructorProperties(vttCue, props.vttCue);
    dispatch(updateVttCue(props.index, vttCue, props.editUuid, true));
};

const changeVttCueInReduxDebounced = _.debounce(changeVttCueInRedux, 200);

const getCharacterCountPerLine = (text: string): number[] => {
    const lines = text.match(/[^\r\n]+/g) || [text];
    return lines.map((line: string): number => line.length);
};

const getWordCountPerLine = (text: string): number[] => {
    const lines = text.match(/[^\r\n]+/g) || [text];
    return lines.map((line: string): number => line.match(/\S+/g)?.length || 0);
};

const createCorrectSpellingHandler = (
    editorState: EditorState,
    dispatch: Dispatch<AppThunk>,
    props: CueTextEditorProps
) => (replacement: string, start: number, end: number): void => {
    let contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const typoSelectionState = selectionState.set("anchorOffset", start).set("focusOffset", end) as SelectionState;
    const startKey = typoSelectionState.getStartKey();
    const typoBlock = contentState.getBlockForKey(startKey);
    const inlineStyle = typoBlock.getInlineStyleAt(start);
    contentState = Modifier.replaceText(contentState, typoSelectionState, replacement, inlineStyle);
    const newEditorState = EditorState.push(editorState, contentState, "change-block-data");
    dispatch(updateEditorState(props.index, newEditorState));
    dispatch(callSaveTrack());
};

const CueTextEditor = (props: CueTextEditorProps): ReactElement => {
    const [spellCheckerMatchingOffset, setSpellCheckerMatchingOffset] = useState(null);
    const editorRef = useRef(null);
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

    const keyShortcutBindings = (e: React.KeyboardEvent<{}>): string | null => {
        const action = getActionByKeyboardEvent(e);
        if (action) {
            return action;
        }
        if(spellCheckerMatchingOffset && (e.keyCode === Character.ENTER || e.keyCode === Character.ESCAPE)) {
            return "popoverHandled";
        } else if (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
            if (e.keyCode === Character.ESCAPE) {
                return "closeEditor";
            } else if (e.keyCode === Character.ENTER) {
                return "editNext";
            }
        } else if (e.keyCode === Character.ENTER) {
            return "newLine";
        } else if ((e.ctrlKey || e.metaKey ) && e.key === " ") {
            return "openSpellChecker";
        }
        return getDefaultKeyBinding(e);
    };

    const findSpellCheckIssues = (_contentBlock: ContentBlock, callback: Function): void => {
        if (props.spellCheck && props.spellCheck.matches) {
            props.spellCheck.matches.forEach(match => callback(match.offset, match.offset + match.length));
        }
    };
    const newSpellCheckDecorator = new CompositeDecorator([
        {
            strategy: findSpellCheckIssues,
            component: SpellCheckIssue,
            props: {
                spellCheck: props.spellCheck,
                correctSpelling: createCorrectSpellingHandler(editorState, dispatch, props),
                editorRef,
                spellCheckerMatchingOffset,
                setSpellCheckerMatchingOffset,
                bindCueViewModeKeyboardShortcut: props.bindCueViewModeKeyboardShortcut
            }
        }
    ]);
    editorState = EditorState.set(editorState, { decorator: newSpellCheckDecorator });

    const currentContent = editorState.getCurrentContent();
    const unmountContentRef = useRef(currentContent);
    const currentInlineStyle = editorState.getCurrentInlineStyle();
    const charCountPerLine = getCharacterCountPerLine(currentContent.getPlainText());
    const wordCountPerLine = getWordCountPerLine(currentContent.getPlainText());
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
            unmountContentRef.current = currentContent;
            changeVttCueInReduxDebounced(currentContent, props, dispatch);
        },
        // Two bullet points in this suppression:
        //  - props.vttCue is not included, because it causes endless FLUX loop.
        //  - spread operator for cue values is used so that all the VTTCue properties code can be in single file.
        // eslint-disable-next-line
        [ currentContent, currentInlineStyle, dispatch, props.index, ...constructCueValuesArray(props.vttCue) ]
    );

    // Fire update VTTCue action when component is unmounted.
    // So content is not lost when unmounted before next debounce.
    useEffect(
        () => (): void => {
            changeVttCueInReduxDebounced.cancel();
            changeVttCueInRedux(unmountContentRef.current, props, dispatch);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
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
                    display: "flex",
                    flexDirection: "row",
                    flexBasis: "50%",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px"
                }}
            >
                <div style={{ flex: 1 }}>
                    <Editor
                        editorState={editorState}
                        onChange={(newEditorState: EditorState): void => {
                            dispatch(updateEditorState(props.index, newEditorState));
                            if (editorState.getCurrentContent() !== newEditorState.getCurrentContent()) {
                                dispatch(callSaveTrack());
                            }
                        }}
                        ref={editorRef}
                        spellCheck={false}
                        keyBindingFn={keyShortcutBindings}
                        handleKeyCommand={handleKeyShortcut(editorState, dispatch, props,
                            spellCheckerMatchingOffset,
                            setSpellCheckerMatchingOffset)}
                    />
                </div>
                <div style={{ flex: 0 }}>
                    { charCountPerLine.map((count: number, index: number) => (
                        <div key={index}><span className="sbte-count-tag">{count} ch</span><br /></div>
                    )) }
                </div>
                <div style={{ flex: 0, paddingRight: "5px" }}>
                    { wordCountPerLine.map((count: number, index: number) => (
                        <div key={index}><span className="sbte-count-tag">{count} w</span><br /></div>
                    )) }
                </div>
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
