import React, { MutableRefObject, ReactElement, RefObject, useRef, useState } from "react";
import { Overlay, Popover } from "react-bootstrap";
import Select, { Styles, ValueType } from "react-select";
import { v4 as uuidv4 } from "uuid";

import { SpellCheck } from "./model";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { removeSpellcheckMatch, validateCue } from "../cueSlices";
import { addIgnoredKeyword } from "./spellCheckerUtils";

interface Props {
    children: ReactElement;
    spellCheck: SpellCheck;
    start: number;
    end: number;
    correctSpelling: (replacement: string, start: number, end: number) => void;
    openSpellCheckPopupId: string | null;
    setOpenSpellCheckPopupId: (id: string | null) => void;
    editorRef: RefObject<HTMLInputElement>;
    cueId: string;
    cueIdx: number;
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
    const dispatch = useDispatch();
    //@ts-ignore
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const [spellCheckPopupId] = useState(uuidv4());
    const target = useRef(null);
    const showAtBottom = popupPlacement(target);

    const reValidateCue = (): void => {
        dispatch(validateCue(props.cueIdx, props.cueId));
    };

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

    const ignoreKeyword = (): void => {
        if (editingTrack != null && editingTrack.id != null) {
            //@ts-ignore
            addIgnoredKeyword(editingTrack.id, props.cueId, props.decoratedText);
        }
        dispatch(removeSpellcheckMatch(props.cueIdx, props.start));
        reValidateCue();
        props.editorRef?.current?.focus();

    };

    return (
        <span
            ref={target}
            className="sbte-text-with-error"
            onClick={
                (): void => props.setOpenSpellCheckPopupId(
                    props.openSpellCheckPopupId === spellCheckPopupId ? null : spellCheckPopupId
                )
            }
        >
            {props.children}
            <Overlay
                target={target.current}
                show={props.openSpellCheckPopupId === spellCheckPopupId}
                placement={showAtBottom ? "bottom" : "bottom"}
            >
                <Popover id="sbte-spell-check-popover">
                    <Popover.Title>{spellCheckMatch.message}</Popover.Title>
                    <Popover.Content hidden={selectOptions.length === 0} style={{ padding: 0 }}>
                        <button onClick={ignoreKeyword} className="btn btn-primary col-md-12">Ignore</button>
                        <Select
                            menuIsOpen
                            options={selectOptions}
                            styles={customStyles}
                            onChange={(option: ValueType<Option>): void =>
                                props.correctSpelling((option as Option).value, props.start, props.end)}
                        />
                    </Popover.Content>
                </Popover>
            </Overlay>
        </span>
    );
};
