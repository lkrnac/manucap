import React, { MutableRefObject, ReactElement, RefObject, useRef } from "react";
import { Overlay, Popover } from "react-bootstrap";
import Select, { Styles, ValueType } from "react-select";
import { SpellCheck } from "./model";
import { Character, KeyCombination } from "../../shortcutConstants";


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

export const SpellCheckIssue = (props: Props): ReactElement | null => {
    const target = useRef(null);
    const selectRef = useRef<Select>(null);
    const showAtBottom = popupPlacement(target);

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

    const customStyles = {
        control: () => ({ visibility: "hidden", height: "0px" }),
        container: (provided) => ({ ...provided, height: "100%" }),
        menu: (provided) => ({ ...provided, position: "static", height: "100%", margin: 0 }),
        menuList: (provided) => ({ ...provided, height: "200px" })
    } as Styles;

    //@ts-ignore
    const onExitPopover = (): void => {
        console.log("onExitPopover");
        props.bindCueViewModeKeyboardShortcut();
        props.editorRef?.current?.focus();
    };

    const onEnterPopover = (): void => {
        Mousetrap.bind(KeyCombination.ESCAPE, () => props.setSpellCheckerMatchingOffset(null));
        Mousetrap.unbind(KeyCombination.ENTER);
        // @ts-ignore since menuListRef uses React.Ref<any> type firstElementChild can be found as a property
        selectRef.current?.select.menuListRef?.firstElementChild?.focus();
    };

    const onOptionSelected = (option: ValueType<Option>): void => {
        props.correctSpelling((option as Option).value, props.start, props.end);
        props.setSpellCheckerMatchingOffset(null);
    };

    const onkeydown = (e: React.KeyboardEvent<{}>): void => {
        if ((e.ctrlKey || e.metaKey) && e.keyCode === Character.SPACE) {
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
                onEntered={onEnterPopover}
                onExited={onExitPopover}
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
