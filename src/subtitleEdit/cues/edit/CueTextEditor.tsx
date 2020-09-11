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
import { hasIgnoredKeyword } from "../spellCheck/spellCheckerUtils";

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
    } else if (e.keyCode === Character.ENTER) {
        return "newLine";
    }
    return getDefaultKeyBinding(e);
};

const handleKeyShortcut = (
    editorState: EditorState,
    dispatch: Dispatch<AppThunk>,
    props: CueTextEditorProps
) => (shortcut: string): DraftHandleValue => {
    const keyCombination = mousetrapBindings.get(shortcut);
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
}

const changeVttCueInRedux = (
    //@ts-ignore
    editorState: EditorState,
    currentContent: ContentState,
    props: CueTextEditorProps,
    dispatch: Dispatch<AppThunk>,
): void => {
    // console.log(editorState);
    // console.log(currentContent);
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
    const [openSpellCheckPopupId, setOpenSpellCheckPopupId] = useState(null);
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
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



    const findSpellCheckIssues = (_contentBlock: ContentBlock, callback: Function): void => {
        if (props.spellCheck && props.spellCheck.matches) {
            console.log(props.spellCheck.matches);
            props.spellCheck.matches.forEach(match => {
                    if (editingTrack?.id && props.editUuid) {
                        const endOffset = match.offset + match.length;
                        const keyword = _contentBlock.getText().slice(match.offset, endOffset);
                        if (!hasIgnoredKeyword(editingTrack.id, props.editUuid, keyword, match.rule.id)) {
                            callback(match.offset, endOffset);
                        }
                    }
                }
            );
        }
    };
    const newSpellCheckDecorator = new CompositeDecorator([
        {
            strategy: findSpellCheckIssues,
            component: SpellCheckIssue,
            props: {
                spellCheck: props.spellCheck,
                correctSpelling: createCorrectSpellingHandler(editorState, dispatch, props),
                openSpellCheckPopupId,
                setOpenSpellCheckPopupId,
                cueId: props.editUuid,
                cueIdx: props.index,
                editorRef
            }
        }
    ]);
    editorState = EditorState.set(editorState, { decorator: newSpellCheckDecorator });

    const currentContent = editorState.getCurrentContent();
    const unmountContentRef = useRef<ContentState | null>(null);
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
        [currentContent, currentInlineStyle, dispatch, props.index]
    );

    useEffect(
        () => {
            // Only need to update vttCue if ContentState is changing
            const shouldUpdateVttCue = unmountContentRef.current === null
                || unmountContentRef.current !== currentContent;
            unmountContentRef.current = currentContent;
            if (shouldUpdateVttCue) {
                changeVttCueInReduxDebounced(editorState, currentContent, props, dispatch);
            }
        },
        // Two bullet points in this suppression:
        //  - props.vttCue is not included, because it causes endless FLUX loop.
        //  - spread operator for cue values is used so that all the VTTCue properties code can be in single file.
        // eslint-disable-next-line
        [currentContent, currentInlineStyle, dispatch, props.index, ...constructCueValuesArray(props.vttCue)]
    );

    // Fire update VTTCue action when component is unmounted.
    // So content is not lost when unmounted before next debounce.
    useEffect(
        () => (): void => {
            changeVttCueInReduxDebounced.cancel();
            if (unmountContentRef.current !== null) {
                changeVttCueInRedux(editorState, unmountContentRef.current, props, dispatch);
            }
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
                        handleKeyCommand={handleKeyShortcut(editorState, dispatch, props)}
                    />
                </div>
                <div style={{ flex: 0 }}>
                    {charCountPerLine.map((count: number, index: number) => (
                        <div key={index}><span className="sbte-count-tag">{count} ch</span><br /></div>
                    ))}
                </div>
                <div style={{ flex: 0, paddingRight: "5px" }}>
                    {wordCountPerLine.map((count: number, index: number) => (
                        <div key={index}><span className="sbte-count-tag">{count} w</span><br /></div>
                    ))}
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
