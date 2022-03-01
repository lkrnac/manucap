import { ReactElement, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import { KeyCombination } from "../../utils/shortcutConstants";
import KeyboardShortcutLabel from "./KeyboardShortcutLabel";
import Modal from "react-bootstrap/Modal";
import Mousetrap from "mousetrap";
import { TooltipWrapper } from "../../TooltipWrapper";

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
            <TooltipWrapper
                tooltipId="keyboardShortcutsToolboxBtnTooltip"
                text="Keyboard Shortcuts"
                placement="right"
            >
                <button
                    className="dotsub-keyboard-shortcuts-button btn"
                    onClick={handleShow}
                    type="button"
                >
                    <i className="fa-duotone fa-keyboard fa-2x" data-fa-transform="grow-6" />
                </button>
            </TooltipWrapper>

            <Modal show={show} onHide={handleClose} centered dialogClassName="sbte-medium-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Keyboard Shortcuts</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default KeyboardShortcuts;
