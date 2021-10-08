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
    SelectionState
} from "draft-js";
import { useDispatch, useSelector } from "react-redux";
import Mousetrap from "mousetrap";
import _ from "lodash";

import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { Character, getActionByKeyboardEvent, mousetrapBindings } from "../../utils/shortcutConstants";
import { constructCueValuesArray, copyNonConstructorProperties } from "../cueUtils";
import { convertVttToHtml, getVttText } from "./cueTextConverter";
import CueLineCounts from "../cueLine/CueLineCounts";
import InlineStyleButton from "./InlineStyleButton";
import { updateEditorState } from "./editorStatesSlice";
import { applySpellcheckerOnCue, updateVttCue } from "../cuesList/cuesListActions";
import { SpellCheck } from "../spellCheck/model";
import { SpellCheckIssue } from "../spellCheck/SpellCheckIssue";

import { SearchReplaceMatch } from "../searchReplace/SearchReplaceMatch";
import { replaceContent } from "./editUtils";
import { SearchReplaceMatches } from "../searchReplace/model";
import { searchNextCues, setReplacement } from "../searchReplace/searchReplaceSlices";
import { CueExtraCharacters } from "./CueExtraCharacters";
import { hasIgnoredKeyword } from "../spellCheck/spellCheckerUtils";
import { SubtitleSpecification } from "../../toolbox/model";
import { Track } from "../../model";
import { setGlossaryTerm } from "./cueEditorSlices";

const findSpellCheckIssues = (props: CueTextEditorProps, editingTrack: Track | null, spellcheckerEnabled: boolean) =>
    (_contentBlock: ContentBlock, callback: Function): void => {
        if (props.spellCheck && props.spellCheck.matches  && spellcheckerEnabled) {
            props.spellCheck.matches.forEach(match => {
                if (!hasIgnoredKeyword(match, editingTrack?.id)) {
                    callback(match.offset, match.offset + match.length);
                }
            });
        }
    };

const findSearchReplaceMatch =
    (props: CueTextEditorProps) => (_contentBlock: ContentBlock, callback: Function): void => {
        if (props.searchReplaceMatches && props.searchReplaceMatches.offsets.length > 0) {
            const offset = props.searchReplaceMatches.offsets[props.searchReplaceMatches.offsetIndex];
            callback(offset, offset + props.searchReplaceMatches.matchLength);
        }
    };

const findExtraCharacters = (subtitleSpecifications: SubtitleSpecification | null) =>
    (contentBlock: ContentBlock, callback: Function): void => {
        if (subtitleSpecifications && subtitleSpecifications.enabled && subtitleSpecifications.maxCharactersPerLine) {
            const maxCharactersPerLine = subtitleSpecifications.maxCharactersPerLine;
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

const handleKeyShortcut = (
    editorState: EditorState,
    dispatch: Dispatch<AppThunk>,
    props: CueTextEditorProps,
    spellCheckerMatchingOffset: number | null,
    setSpellCheckerMatchingOffset: Function,
    languageDirection: string | undefined
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
    if (shortcut === "insertBidiCode") {
        const content = editorState.getCurrentContent();
        const bidiChar = languageDirection === "RTL" ? "\u200F" : "\u200E";
        const contentWithBidiCode = Modifier.insertText(content, editorState.getSelection(), bidiChar);
        const newState = EditorState.push(editorState, contentWithBidiCode, "change-block-data");
        dispatch(updateEditorState(props.index, newState));
        return "handled";
    }
    return "not-handled";
};

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
    } else if ((e.ctrlKey || e.metaKey ) && e.shiftKey && e.keyCode === Character.B_CHAR) {
        return "insertBidiCode";
    }
    return getDefaultKeyBinding(e);
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

const insertGlossaryTermIfNeeded = (editorState: EditorState, glossaryTerm: string | null): EditorState => {
    if (glossaryTerm) {
        const content = editorState.getCurrentContent();
        const contentWithGlossaryTerm = Modifier.insertText(content, editorState.getSelection(), glossaryTerm);
        editorState = EditorState.push(editorState, contentWithGlossaryTerm, "change-block-data");
        editorState = EditorState.forceSelection(editorState, editorState.getSelection());
    }
    return editorState;
};

const replaceIfNeeded = (
    editorState: EditorState,
    searchReplaceMatches: SearchReplaceMatches | undefined,
    replacement: string
): EditorState => {
    if (replacement
        && replacement !== ""
        && searchReplaceMatches
        && searchReplaceMatches.offsets.length > 0
    ) {
        const content = editorState.getCurrentContent();
        const offset = searchReplaceMatches.offsets[searchReplaceMatches.offsetIndex];
        const selectionState = editorState.getSelection();
        const endOffset = offset + searchReplaceMatches.matchLength;
        const searchSelection =
            selectionState.set("anchorOffset", offset).set("focusOffset", endOffset) as SelectionState;
        editorState = EditorState.forceSelection(editorState, searchSelection);

        const inlineStyle = editorState.getCurrentInlineStyle();
        const contentWithReplacement = Modifier.replaceText(content, searchSelection, replacement, inlineStyle);
        editorState = EditorState.push(editorState, contentWithReplacement, "change-block-data");
    }
    return editorState;
};

const CueTextEditor = (props: CueTextEditorProps): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const spellcheckerEnabled = useSelector((state: SubtitleEditState) => state.spellCheckerSettings.enabled);
    const subtitleSpecifications = useSelector((state: SubtitleEditState) => state.subtitleSpecifications);
    const replacement = useSelector((state: SubtitleEditState) => state.searchReplace.replacement);

    const [spellCheckerMatchingOffset, setSpellCheckerMatchingOffset] = useState(null);
    const editorRef = useRef(null);
    const dispatch = useDispatch();
    const processedHTML = convertFromHTML(convertVttToHtml(props.vttCue.text));
    let editorState = useSelector(
        (state: SubtitleEditState) => state.editorStates.get(props.index) as EditorState,
        ((left: EditorState) => !left) // don't re-render if previous editorState is defined -> delete action
    );
    const glossaryTerm = useSelector((state: SubtitleEditState) => state.glossaryTerm);

    const unmountContentRef = useRef<ContentState | null>(null);
    const imeCompositionRef = useRef<string | null>(null);

    if (!editorState) {
        const initialContentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        editorState = EditorState.createWithContent(initialContentState);
        editorState = EditorState.moveFocusToEnd(editorState);
    }

    // If in composition mode (i.e. for IME input or diacritics), the decorator re-renders cannot
    // happen because it will cause an error in the draft-js composition handler.
    if (!imeCompositionRef.current) {
        const newCompositeDecorator = new CompositeDecorator([
            {
                strategy: findSearchReplaceMatch(props),
                component: SearchReplaceMatch,
            },
            {
                strategy: findExtraCharacters(subtitleSpecifications),
                component: CueExtraCharacters,
                props: {}
            },
            {
                strategy: findSpellCheckIssues(props, editingTrack, spellcheckerEnabled),
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
    }

    editorState = insertGlossaryTermIfNeeded(editorState, glossaryTerm);
    editorState = replaceIfNeeded(editorState, props.searchReplaceMatches, replacement);
    const currentContent = editorState.getCurrentContent();
    const currentInlineStyle = editorState.getCurrentInlineStyle();
    const charCountPerLine = getCharacterCountPerLine(currentContent.getPlainText());
    const wordCountPerLine = getWordCountPerLine(currentContent.getPlainText());

    useEffect(
        () => {
            if (!props.spellCheck) {
                dispatch(applySpellcheckerOnCue(props.index));
            }
        },
        // needed to call the effect only once
        // eslint-disable-next-line
        []
    );

    useEffect(
        () => {
            dispatch(setGlossaryTerm(null));
            if (replacement !== "") {
                dispatch(setReplacement(""));
                dispatch(searchNextCues(true));
            }
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
            const shouldUpdateVttCue = unmountContentRef.current !== null
                && unmountContentRef.current !== currentContent;
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
            if (unmountContentRef.current !== null && unmountContentRef.current !== currentContent) {
                changeVttCueInRedux(unmountContentRef.current, props, dispatch);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props]
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
                <div
                    style={{ flex: 1 }}
                    onCompositionStart={(): void => { imeCompositionRef.current = "start"; }}
                    onCompositionEnd={(): void => { imeCompositionRef.current = "end"; }}
                >
                    <Editor
                        editorState={editorState}
                        onChange={(newEditorState: EditorState): AppThunk | undefined => {
                            if (imeCompositionRef.current === "end") {
                                imeCompositionRef.current = null;
                            }

                            // https://dotsub.atlassian.net/browse/DSD-787
                            let newUpdatedState = newEditorState;
                            const oldVttText = getVttText(editorState.getCurrentContent());
                            const newVttText = getVttText(newEditorState.getCurrentContent());
                            if (newEditorState.getLastChangeType() === "apply-entity" && oldVttText !== newVttText) {
                                const processedHTML = convertFromHTML(convertVttToHtml(oldVttText));
                                const initialContentState =
                                    ContentState.createFromBlockArray(processedHTML.contentBlocks);
                                newUpdatedState = EditorState.createWithContent(initialContentState);
                                newUpdatedState = EditorState.moveFocusToEnd(newUpdatedState);
                            }

                            return dispatch(updateEditorState(props.index, newUpdatedState));
                        }}
                        ref={editorRef}
                        spellCheck={false}
                        keyBindingFn={keyShortcutBindings(spellCheckerMatchingOffset)}
                        handleKeyCommand={handleKeyShortcut(editorState, dispatch, props,
                            spellCheckerMatchingOffset,
                            setSpellCheckerMatchingOffset,
                            editingTrack?.language.direction)}
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
