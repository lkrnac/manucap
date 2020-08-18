import React, { MutableRefObject, ReactElement, useRef, useState } from "react";
import { Overlay, Popover } from "react-bootstrap";
import Select, { Styles, ValueType } from "react-select";

import { SpellCheck } from "./model";
import { Character } from "../../shortcutConstants";

interface Props {
    children: ReactElement;
    spellCheck: SpellCheck;
    start: number;
    end: number;
    correctSpelling: (replacement: string, start: number, end: number) => void;
    openSpellCheckPopupId: number | null;
    setOpenSpellCheckPopupId: (id: number | null) => void;
    editorRef: any;
}

//@ts-ignore
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
    const [spellCheckPopupId] = useState(props.start);
    const target = useRef(null);
    //@ts-ignore
    const container = useRef(null);
    //@ts-ignore
    let selectRef: any;
    //@ts-ignore
    const showAtBottom = popupPlacement(target);

    const spellCheckMatch = props.spellCheck.matches
        .filter(match => match.offset === props.start && match.offset + match.length === props.end)
        .pop();


    if (!spellCheckMatch) {
        return props.children;
    }

    //@ts-ignore
    const selectOptions = spellCheckMatch.replacements
        .filter((replacement) => replacement.value.trim() !== "")
        .map((replacement) => ({ value: replacement.value, label: replacement.value } as Option)
        );

    //@ts-ignore
    const customStyles = {
        control: () => ({ visibility: "hidden", height: "0px" }),
        container: (provided) => ({ ...provided, height: "100%" }),
        menu: (provided) => ({ ...provided, position: "static", height: "100%", margin: 0 }),
        menuList: (provided) => ({ ...provided, height: "200px" })
    } as Styles;


    const handlePopoverShortcut = (e: React.KeyboardEvent<{}>): void => {
        if (e.keyCode === Character.ESCAPE) {
            props.setOpenSpellCheckPopupId(null);
        }

    };
    //@ts-ignore
    const onExitPopover = (e: any): void => {
        props.editorRef?.current?.focus();
    };

    //@ts-ignore
    const onEnterPopover = (e: any): void => {
        console.log("onEnterPopover >> ");
        console.log("spellCheckMatch:0  " + spellCheckMatch.offset);
        console.log("props.start:1  " + props.start);
        console.log(props);
        selectRef?.select.inputRef.focus();
    };
    return (
        <span
            ref={target}
            className="sbte-text-with-error"
            onClick={
                (): void => {
                    props.setOpenSpellCheckPopupId(
                        props.openSpellCheckPopupId === spellCheckPopupId ? null : spellCheckPopupId
                    );
                }

            }
        >
            {props.children}
            <div style={{ display: "inline-block" }} ref={container}>
                <Overlay
                    container={container}
                    onEntered={onEnterPopover}
                    onExited={onExitPopover}
                    target={target.current}
                    show={props.openSpellCheckPopupId === spellCheckPopupId}
                    placement={"bottom"}
                >
                    <Popover id="sbte-spell-check-popover">
                        <Popover.Title>{spellCheckMatch.message}</Popover.Title>
                        <Popover.Content hidden={selectOptions.length === 0} style={{ padding: 0 }}>
                            <Select
                                ref={ref => {
                                    selectRef = ref;
                                }}

                                onKeyDown={handlePopoverShortcut}
                                menuIsOpen
                                options={selectOptions}
                                styles={customStyles}
                                onChange={(option: ValueType<Option>): void =>
                                    props.correctSpelling((option as Option).value, props.start, props.end)}
                            />
                        </Popover.Content>
                    </Popover>
                </Overlay>
            </div>
        </span>
    );
};
