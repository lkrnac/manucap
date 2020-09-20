import React, { MutableRefObject, ReactElement, RefObject, useEffect, useRef } from "react";
import { Overlay, Popover } from "react-bootstrap";
import Select, { Styles, ValueType } from "react-select";
import { SpellCheck } from "./model";
import { Character } from "../../shortcutConstants";
import { useDispatch } from "react-redux";
import { addIgnoredKeyword } from "./spellCheckerUtils";
import { removeSpellcheckMatchFromAllCues, validateAllCues } from "../cueSlices";


interface Props {
    children: ReactElement;
    decoratedText: string;
    spellCheck: SpellCheck;
    start: number;
    end: number;
    correctSpelling: (replacement: string, start: number, end: number) => void;
    spellCheckerMatchingOffset: number | null;
    setSpellCheckerMatchingOffset: (id: number | null) => void;
    editorRef: RefObject<HTMLInputElement>;
    bindCueViewModeKeyboardShortcut: () => void;
    unbindCueViewModeKeyboardShortcut: () => void;
    cueId: string;
    cueIdx: number;
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
    title?: string;
}

export const SpellCheckIssue = (props: Props): ReactElement | null => {
    const dispatch = useDispatch();
    const target = useRef(null);
    const selectRef = useRef<Select>(null);
    const showAtBottom = popupPlacement(target);
    const onExitPopover = (): void => {
        props.editorRef?.current?.focus();
        props.bindCueViewModeKeyboardShortcut();
    };

    useEffect(
        () => (): void => {
            props.bindCueViewModeKeyboardShortcut();  // Sometimes Overlay got unmounted before onExit event got
            // executed so this to ensure
            // action is done
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
    const selectOptions = spellCheckMatch.replacements
        .filter((replacement) => replacement.value.trim() !== "")
        .map((replacement) => ({ value: replacement.value, label: replacement.value } as Option)
        );
    selectOptions.unshift({ value: props.decoratedText,
        label: "Ignore All", title: `Ignores ${props.decoratedText} in all cues.` });

    const customStyles = {
        control: () => ({ visibility: "hidden", height: "0px" }),
        container: (provided) => ({ ...provided, height: "100%" }),
        menu: (provided) => ({ ...provided, position: "static", height: "100%", margin: 0 }),
        menuList: (provided) => ({ ...provided, height: "200px" })
    } as Styles;

    const onEnterPopover = (): void => {
        props.unbindCueViewModeKeyboardShortcut();
        // @ts-ignore since menuListRef uses React.Ref<any> type firstElementChild can be found as a property
        selectRef.current?.select.menuListRef?.firstElementChild?.focus();
    };
    const revalidateAllCues = (): void => {
        dispatch(validateAllCues());
    };

    const ignoreKeyword = (): void => {
        console.log(`ignoreKeyword  props.decoratedText >>> ${props.decoratedText}`);

        addIgnoredKeyword(props.trackId, props.decoratedText, spellCheckMatch.rule.id);
        dispatch(removeSpellcheckMatchFromAllCues());
        revalidateAllCues();
    };

    const onOptionSelected = (optionValueType: ValueType<Option>): void => {
        const option = optionValueType as Option;
        if(option.value === props.decoratedText) {
            ignoreKeyword();
        } else {
            props.correctSpelling((option).value, props.start, props.end);
        }
        props.setSpellCheckerMatchingOffset(null);
    };

    const onkeydown = (e: React.KeyboardEvent<{}>): void => {
        if (e.keyCode === Character.TAB || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === Character.SPACE)) {
            e.preventDefault();
        }
        if(e.keyCode === Character.ESCAPE) {
            props.setSpellCheckerMatchingOffset(null);
        }
    };

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
            <Overlay
                onEntering={onEnterPopover}
                onExiting={onExitPopover}
                target={target.current}
                show={props.spellCheckerMatchingOffset === props.start}
                placement={showAtBottom ? "bottom" : "top"}
            >
                <Popover id="sbte-spell-check-popover">
                    <Popover.Title>{spellCheckMatch.message}</Popover.Title>
                    <Popover.Content hidden={selectOptions.length === 0} style={{ padding: 0 }}>
                        <Select
                            onKeyDown={onkeydown}
                            ref={selectRef}
                            menuIsOpen
                            options={selectOptions}
                            styles={customStyles}
                            onChange={onOptionSelected}
                            classNamePrefix="spellcheck"
                        />
                    </Popover.Content>
                </Popover>
            </Overlay>
        </span>
    );
};
