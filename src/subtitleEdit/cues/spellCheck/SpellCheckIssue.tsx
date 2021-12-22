import {
    CSSProperties,
    Dispatch, KeyboardEventHandler,
    MutableRefObject,
    ReactElement,
    RefObject,
    useEffect,
    useRef,
} from "react";

import * as React from "react";
import { Overlay, Popover } from "react-bootstrap";
import Select, { OnChangeValue } from "react-select";
import { Match, SpellCheck } from "./model";
import { Character } from "../../utils/shortcutConstants";
import { useDispatch, useSelector } from "react-redux";
import { addIgnoredKeyword, getMatchText } from "./spellCheckerUtils";
import {
    removeIgnoredSpellcheckedMatchesFromAllCues,
    updateMatchedCues,
    validateCorruptedCues
} from "../cuesList/cuesListActions";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { StylesConfig } from "react-select/dist/declarations/src/styles";


interface Props {
    children: ReactElement;
    spellCheck: SpellCheck;
    start: number;
    end: number;
    correctSpelling: (replacement: string, start: number, end: number) => void;
    spellCheckerMatchingOffset: number | null;
    setSpellCheckerMatchingOffset: (id: number | null) => void;
    editorRef: RefObject<HTMLInputElement>;
    bindCueViewModeKeyboardShortcut: () => void;
    unbindCueViewModeKeyboardShortcut: () => void;
    trackId: string;
}

const popupPlacement = (target: MutableRefObject<null>): boolean => {
    if (target !== null && target.current !== null) {
        // @ts-ignore false positive -> we do null check
        const position = target.current.getBoundingClientRect();
        return window.innerHeight - position.bottom > 320;
    }
    return true;
};

interface Option {
    value: string;
    label: string;
}

const onEnterPopover = (props: Props, selectRef: RefObject<Select>): void => {
    props.unbindCueViewModeKeyboardShortcut();
    // @ts-ignore since menuListRef uses React.Ref<any> type firstElementChild can be found as a property
    selectRef?.current?.menuListRef?.firstElementChild?.focus();
};

const onExitPopover = (props: Props): void => {
    props.editorRef?.current?.focus();
    props.bindCueViewModeKeyboardShortcut();
};

const ignoreKeyword = (props: Props, matchText: string, spellCheckMatch: Match, dispatch: Dispatch<AppThunk>): void => {
    addIgnoredKeyword(props.trackId, matchText, spellCheckMatch.rule.id);
    dispatch(removeIgnoredSpellcheckedMatchesFromAllCues());
    dispatch(validateCorruptedCues(matchText));
    dispatch(updateMatchedCues());
};

const onOptionSelected = (props: Props, spellCheckMatch: Match, matchText: string , dispatch: Dispatch<AppThunk>) =>
    (optionValueType: OnChangeValue<Option, false>): void => {
    const option = optionValueType as Option;
    if(option.value === matchText) {
        ignoreKeyword(props, matchText, spellCheckMatch, dispatch);
    }
    props.correctSpelling((option).value, props.start, props.end);
    props.setSpellCheckerMatchingOffset(null);
};

const onkeydown = (setSpellCheckerMatchingOffset: Function): KeyboardEventHandler =>
    (e: React.KeyboardEvent): void => {
    if (e.keyCode === Character.TAB || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === Character.SPACE)) {
        e.preventDefault();
    }
    if(e.keyCode === Character.ESCAPE) {
        setSpellCheckerMatchingOffset(null);
    }
};

export const SpellCheckIssue = (props: Props): ReactElement | null => {
    const dispatch = useDispatch();
    const target = useRef(null);
    const selectRef = useRef(null);
    const showAtBottom = popupPlacement(target);
    const searchReplaceFind = useSelector((state: SubtitleEditState) => state.searchReplace.find);

    /**
     * Sometimes Overlay got unmounted before
     * onExit event got executed so this to ensure
     * onExit logic is done
     */
    useEffect(
        () => (): void => {
            if(searchReplaceFind === "") {
                props.editorRef?.current?.focus();
            }
            props.bindCueViewModeKeyboardShortcut();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once -> unmount
    );
    const spellCheckMatch = props.spellCheck.matches
        .filter(match => match.offset === props.start && match.offset + match.length === props.end)
        .pop();
    if (!spellCheckMatch) {
        return props.children;
    }
    const matchText = getMatchText(spellCheckMatch);
    const selectOptions = spellCheckMatch.replacements
        .filter((replacement) => replacement.value.trim() !== "")
        .map((replacement) => ({ value: replacement.value, label: replacement.value } as Option)
        );
    selectOptions.unshift({ value: matchText, label: "Ignore all in this track" });

    const customStyles = {
        control: () => ({ visibility: "hidden", height: "0px" }),
        container: (provided: CSSProperties) => ({ ...provided, height: "100%" }),
        menu: (provided: CSSProperties) => ({ ...provided, position: "static", height: "100%", margin: 0 }),
        menuList: (provided: CSSProperties) => ({ ...provided, height: "200px" })
    } as StylesConfig<Option, false>;

    return (
        <span
            ref={target}
            className="sbte-text-with-error"
            onClick={
                (): void => {
                    props.setSpellCheckerMatchingOffset(
                        props.spellCheckerMatchingOffset === props.start ? null : props.start
                    );
                }

            }
        >
            {props.children}
            {/* TODO fix IJ/TS warnings */}
            <Overlay
                onEntering={(): void => onEnterPopover(props, selectRef)}
                onExiting={(): void => onExitPopover(props)}
                target={target.current}
                show={props.spellCheckerMatchingOffset === props.start}
                placement={showAtBottom ? "bottom" : "top"}
            >
                <Popover id="sbte-spell-check-popover">
                    <Popover.Title>{spellCheckMatch.message}</Popover.Title>
                    <Popover.Content hidden={selectOptions.length === 0} style={{ padding: 0 }}>
                        <Select
                            onKeyDown={onkeydown(props.setSpellCheckerMatchingOffset)}
                            ref={selectRef}
                            menuIsOpen
                            options={selectOptions}
                            styles={customStyles}
                            onChange={onOptionSelected(props, spellCheckMatch, matchText, dispatch)}
                            classNamePrefix="spellcheck"
                        />
                    </Popover.Content>
                </Popover>
            </Overlay>
        </span>
    );
};
