import {
    CSSProperties,
    Dispatch,
    KeyboardEventHandler,
    ReactElement,
    RefObject,
    useEffect,
    useRef,
    useState,
} from "react";

import * as React from "react";
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
import { Popover, Transition } from "@headlessui/react";
import { usePopper } from "react-popper";

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
    const selectRef = useRef(null);
    const searchReplaceFind = useSelector((state: SubtitleEditState) => state.searchReplace.find);

    /**
     * Sometimes Overlay got unmounted before
     * onExit event got executed so this to ensure
     * onExit logic is done
     */
    useEffect(
        () => (): void => {
            if (searchReplaceFind === "") {
                props.editorRef?.current?.focus();
            }
            props.bindCueViewModeKeyboardShortcut();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once -> unmount
    );

    const [referenceElement, setReferenceElement] = useState<HTMLSpanElement | null>();
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>();
    const { update, styles, attributes } = usePopper(referenceElement, popperElement, {
        placement: "bottom",
        modifiers: [
            {
                name: "offset",
                options: {
                    offset: [0, 10]
                },
            }
        ]
    });

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
        menu: (provided: CSSProperties) => ({
            ...provided,
            position: "static",
            height: "100%",
            margin: 0,
            boxShadow: "none",
            borderRadius: 0,
            border: "none",
        }),
        menuList: (provided: CSSProperties) => ({ ...provided, height: "200px" })
    } as StylesConfig<Option, false>;

    const show = props.spellCheckerMatchingOffset === props.start;

    return (
        <Popover className="tw-inline-block">
            <Popover.Button className="tw-inline-block tw-outline-none focus:tw-outline-none">
                <span
                    ref={setReferenceElement}
                    className="sbte-text-with-error"
                    onClick={(): void => {
                        props.setSpellCheckerMatchingOffset(
                            props.spellCheckerMatchingOffset === props.start ? null : props.start
                        );
                    }}
                >
                    {props.children}
                </span>
            </Popover.Button>
            <Popover.Panel
                static
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
                className={`tw-z-40 tw-max-w-[276px] tw-popper-wrapper tw-open-${show}`}
            >
                <Transition
                    show={show}
                    className="tw-transition-opacity tw-duration-300 tw-ease-in-out"
                    enterFrom="tw-opacity-0"
                    enterTo="tw-opacity-100"
                    leaveFrom="tw-opacity-100"
                    leaveTo="tw-opacity-0"
                    beforeEnter={async (): Promise<void> => {
                        onEnterPopover(props, selectRef);
                        if (update) {
                            await update();
                        }
                    }}
                    beforeLeave={(): void => onExitPopover(props)}
                >
                    <div
                        className="tw-rounded tw-shadow-sm tw-overflow-hidden
                            tw-border tw-arrow before:tw-border-b-gray-300 tw-border-gray-300"
                        id="sbte-spell-check-popover"
                    >
                        <div className="tw-border-b tw-border-b-gray-300 tw-bg-grey-100 tw-p-2">
                            {spellCheckMatch.message}
                        </div>
                        <div hidden={selectOptions.length === 0}>
                            <Select
                                onKeyDown={onkeydown(props.setSpellCheckerMatchingOffset)}
                                ref={selectRef}
                                menuIsOpen
                                options={selectOptions}
                                styles={customStyles}
                                onChange={onOptionSelected(props, spellCheckMatch, matchText, dispatch)}
                                classNamePrefix="spellcheck"
                            />
                        </div>
                    </div>
                </Transition>
            </Popover.Panel>
        </Popover>
    );
};
