import React, { MutableRefObject, ReactElement, useRef, useState } from "react";
import { Overlay, Popover } from "react-bootstrap";
import Select, { Styles, ValueType } from "react-select";
import ReactDOM from "react-dom";

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
    const container = useRef(null);
    let selectRef: any;
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


    const handleTest= (e: React.KeyboardEvent<{}>): void => {
        if (e.keyCode === Character.ARROW_DOWN) {
            console.log("Arrow down >> ");
        }
    };
    const onEnterPopover = (e: any): void => {


        console.log("onEnterPopover >> ");
        console.log(container);


        console.log("Editor ref");
        console.log(props.editorRef);
        console.log(selectRef);
        console.log(e);
        console.log(props?.editorRef?.current);
        props.editorRef?.current?.blur();

        //@ts-ignore
        document.activeElement?.blur();



        //@ts-ignore
        const overlay = container?.current?.firstChild;

        overlay.tabIndex=0;
        //@ts-ignore
        // eslint-disable-next-line react/no-find-dom-node
        ReactDOM.findDOMNode(container?.current?.firstChild).focus();
        overlay.focus();
        console.log("Focusing on ");
        //@ts-ignore
        console.log(container?.current?.firstChild);
        console.log("Found dom?");
        //@ts-ignore
        // eslint-disable-next-line react/no-find-dom-node
        console.log(ReactDOM.findDOMNode(container?.current?.firstChild));
        // e.scrollIntoView();
        // e.focus();
        // e.firstChild.focus();
        // selectRef?.select.controlRef.focus();
        // selectRef?.focus();
        // console.log("Focus>>>>>>");
        // console.log(selectRef?.select.controlRef);
        //
        // selectRef?.select.controlRef.focus();
        // console.log(e);
        // console.log("selectRef");
        // console.log(selectRef);
        //@ts-ignore
        // console.log(container?.current?.firstChild);
        //@ts-ignore
        // container?.current?.firstChild?.focus({ preventScroll: false });
    };
    return (
        <span
            ref={target}
            className="sbte-text-with-error"
            onClick={
                (): void => {
                    props.setOpenSpellCheckPopupId(
                        props.openSpellCheckPopupId === spellCheckPopupId ? spellCheckPopupId : spellCheckPopupId
                    );
                    console.log("Target");
                    console.log(container.current);
                    console.log(container.current);
                }

            }
        >
            {props.children}
            <div ref={container}>
                <Overlay
                    container={container}
                    onEntered={onEnterPopover}
                    target={target.current}
                    show={props.openSpellCheckPopupId === spellCheckPopupId}
                    placement={showAtBottom ? "bottom" : "top"}
                >
                    <Popover id="sbte-spell-check-popover">
                        <Popover.Title>{spellCheckMatch.message}</Popover.Title>
                        <Popover.Content hidden={selectOptions.length === 0} style={{ padding: 0 }}>
                            <Select
                                ref={ref => {
                                    selectRef = ref;
                                }}

                                onKeyDown={handleTest}
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
