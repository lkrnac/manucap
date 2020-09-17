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
    RichUtils
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
import { SearchReplaceMatch } from "../searchReplace/SearchReplaceMatch";
import { replaceContent } from "./editUtils";
import { SearchReplaceMatches } from "../searchReplace/model";
import { searchNextCues } from "../searchReplace/searchReplaceSlices";
import { CueExtraCharacters } from "../CueExtraCharacters";
import { hasIgnoredKeyword } from "../spellCheck/spellCheckerUtils";

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
    searchReplaceMatches?: SearchReplaceMatches;
    bindCueViewModeKeyboardShortcut: () => void;
    unbindCueViewModeKeyboardShortcut: () => void;
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
    const newEditorState = replaceContent(editorState, replacement, start, end);
    dispatch(updateEditorState(props.index, newEditorState));
    dispatch(callSaveTrack());
};

const isLastSearchMatch = (
    searchReplaceMatches: SearchReplaceMatches
): boolean => searchReplaceMatches && searchReplaceMatches.offsetIndex === searchReplaceMatches.offsets.length - 1;

const createReplaceMatchHandler = (
    editorState: EditorState,
    dispatch: Dispatch<AppThunk>,
    props: CueTextEditorProps,
    unmountContentRef:  React.MutableRefObject<ContentState | null>
) => (replacement: string, start: number, end: number): void => {
    const newEditorState = replaceContent(editorState, replacement, start, end);
    dispatch(updateEditorState(props.index, newEditorState));
    dispatch(callSaveTrack());
    if (props.searchReplaceMatches && isLastSearchMatch(props.searchReplaceMatches)) {
        // Need to ensure ref is set for unmount because searchNextCues will close editor
        // since this is the last search match
        unmountContentRef.current = newEditorState.getCurrentContent();
        dispatch(searchNextCues());
    }
};

const keyShortcutBindings = (spellCheckerMatchingOffset: number | null) =>
    (e: React.KeyboardEvent<{}>): string | null => {
    const action = getActionByKeyboardEvent(e);
    if (action) {
        return action;
    }
    if(spellCheckerMatchingOffset != null && (e.keyCode === Character.ENTER || e.keyCode === Character.ESCAPE)) {
        return "popoverHandled";
    } else if (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (e.keyCode === Character.ESCAPE) {
            return "closeEditor";
        } else if (e.keyCode === Character.ENTER) {
            return "editNext";
        }
    } else if (e.keyCode === Character.ENTER) {
        return "newLine";
    } else if ((e.ctrlKey || e.metaKey ) && e.shiftKey && e.keyCode === Character.SPACE) {
        return "openSpellChecker";
    }
    return getDefaultKeyBinding(e);
};

const CueTextEditor = (props: CueTextEditorProps): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const subtitleSpecifications = useSelector((state: SubtitleEditState) => state.subtitleSpecifications);
    const [spellCheckerMatchingOffset, setSpellCheckerMatchingOffset] = useState(null);
    const editorRef = useRef(null);
    const dispatch = useDispatch();
    const processedHTML = convertFromHTML(convertVttToHtml(props.vttCue.text));
    let editorState = useSelector(
        (state: SubtitleEditState) => state.editorStates.get(props.index) as EditorState,
        ((left: EditorState) => !left) // don't re-render if previous editorState is defined -> delete action
    );
    const unmountContentRef = useRef<ContentState | null>(null);

    if (!editorState) {
        const initialContentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        editorState = EditorState.createWithContent(initialContentState);
        editorState = EditorState.moveFocusToEnd(editorState);
    }

    const findSpellCheckIssues = (contentBlock: ContentBlock, callback: Function): void => {
        if (props.spellCheck && props.spellCheck.matches) {
            props.spellCheck.matches.forEach(match => {
                    if (editingTrack?.id && props.editUuid) {
                        const endOffset = match.offset + match.length;
                        const keyword = contentBlock.getText().slice(match.offset, endOffset);
                        if (!hasIgnoredKeyword(editingTrack.id, keyword, match.rule.id)) {
                            callback(match.offset, endOffset);
                        }
                    }
                }
            );
        }
    };

    const findSearchReplaceMatch = (_contentBlock: ContentBlock, callback: Function): void => {
        if (props.searchReplaceMatches && props.searchReplaceMatches.offsets.length > 0) {
            const offset = props.searchReplaceMatches.offsets[props.searchReplaceMatches.offsetIndex];
            callback(offset, offset + props.searchReplaceMatches.matchLength);
        }
    };

    const findExtraCharacters = (contentBlock: ContentBlock, callback: Function): void => {
        if (subtitleSpecifications && subtitleSpecifications.enabled) {
            const maxCharactersPerLine = subtitleSpecifications.maxCharactersPerLine || 0;
            const text = contentBlock.getText();
            const lines = text.split("\n");
            return lines.forEach(line => {
                const lineStartOffset = text.indexOf(line);
                const lineEndOffset = lineStartOffset + line.length;
                if (line.length > maxCharactersPerLine) {
                    callback(lineStartOffset + maxCharactersPerLine, lineEndOffset);
                }
            });
        }
    };

    const newCompositeDecorator = new CompositeDecorator([
        {
            strategy: findSearchReplaceMatch,
            component: SearchReplaceMatch,
            props: {
                replaceMatch: createReplaceMatchHandler(editorState, dispatch, props, unmountContentRef)
            }
        },
        {
            strategy: findExtraCharacters,
            component: CueExtraCharacters,
            props: {}
        },
        {
            strategy: findSpellCheckIssues,
            component: SpellCheckIssue,
            props: {
                spellCheck: props.spellCheck,
                correctSpelling: createCorrectSpellingHandler(editorState, dispatch, props),
                editorRef,
                spellCheckerMatchingOffset,
                setSpellCheckerMatchingOffset,
                bindCueViewModeKeyboardShortcut: props.bindCueViewModeKeyboardShortcut,
                unbindCueViewModeKeyboardShortcut: props.unbindCueViewModeKeyboardShortcut,
                cueId: props.editUuid,
                cueIdx: props.index,
                trackId: editingTrack?.id
            }
        }
    ]);
    editorState = EditorState.set(editorState, { decorator: newCompositeDecorator });

    const currentContent = editorState.getCurrentContent();
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
            // Only need to update vttCue if ContentState is changing
            const shouldUpdateVttCue = unmountContentRef.current === null
                || unmountContentRef.current !== currentContent;
            unmountContentRef.current = currentContent;
            if (shouldUpdateVttCue) {
                changeVttCueInReduxDebounced(currentContent, props, dispatch);
            }
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
            if (unmountContentRef.current !== null) {
                changeVttCueInRedux(unmountContentRef.current, props, dispatch);
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
                        keyBindingFn={keyShortcutBindings(spellCheckerMatchingOffset)}
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
