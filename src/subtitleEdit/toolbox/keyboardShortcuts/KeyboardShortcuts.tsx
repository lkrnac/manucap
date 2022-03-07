import { ReactElement, useEffect, useState } from "react";
import { KeyCombination } from "../../utils/shortcutConstants";
import KeyboardShortcutLabel from "./KeyboardShortcutLabel";
import Mousetrap from "mousetrap";
import TransitionDialog from "../../common/TransitionDialog";

const KeyboardShortcuts = (): ReactElement => {
    const [show, setShow] = useState(false);
    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);

    useEffect(() => {
        const registerShortcuts = (): void => {
            Mousetrap.bind([KeyCombination.MOD_SHIFT_SLASH, KeyCombination.ALT_SHIFT_SLASH], () => {
                setShow(!show);
            });
        };
        registerShortcuts();
    }, [show]);

    return (
        <>
            <button
                className="btn btn-secondary dotsub-keyboard-shortcuts-button"
                onClick={handleShow}
            >
                <i className="far fa-keyboard" /> Keyboard Shortcuts
            </button>
            <TransitionDialog
                open={show}
                onClose={handleClose}
                dialogClassName="sbte-medium-modal"
                contentClassname="tw-max-w-4xl"
                title="Keyboard Shortcuts"
            >
                <KeyboardShortcutLabel character="o" name="Toggle Play / Pause" />
                <KeyboardShortcutLabel character="k" name="Toggle Play / Pause Current Cue" />
                <KeyboardShortcutLabel character="←" name="Seek Back 1 Second" />
                <KeyboardShortcutLabel character="→" name="Seek Ahead 1 Second" />
                <KeyboardShortcutLabel character="↑" name="Set Cue Start Time" />
                <KeyboardShortcutLabel character="↓" name="Set Cue End Time" />
                <KeyboardShortcutLabel character="Esc" name="Edit Previous Cue" />
                <KeyboardShortcutLabel
                    hideAlternativeKey
                    hideAltKey
                    character="Space"
                    name="Show a spelling error [You must be stepping on an spelling error word]"
                />
                <KeyboardShortcutLabel
                    hideAlternativeKey
                    hideAltKey
                    character="b"
                    name="Insert bidirectional text control code"
                />
                <div className="tw-modal-toolbar">
                    <button className="btn btn-primary" onClick={handleClose}>
                        Close
                    </button>
                </div>
            </TransitionDialog>
        </>
    );
};

export default KeyboardShortcuts;
