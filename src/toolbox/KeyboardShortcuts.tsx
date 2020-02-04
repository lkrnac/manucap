import * as shortcuts from "../utils/shortcutConstants";
import React, { ReactElement, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import KeyboardShortcutLabel from "./KeyboardShortcutLabel";
import Modal from "react-bootstrap/Modal";
import Mousetrap from "mousetrap";

const KeyboardShortcuts = (): ReactElement => {
    const [show, setShow] = useState(false);
    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);

    useEffect(() => {
        const registerShortcuts = (): void => {
            Mousetrap.bind([shortcuts.MOD_SHIFT_SLASH, shortcuts.ALT_SHIFT_SLASH], () => {
                setShow(!show);
            });
        };
        registerShortcuts();
    }, [show]);

    return (
        <>
            <Button variant="light" onClick={handleShow} className="dotsub-keyboard-shortcuts-button">
                Keyboard Shortcuts
            </Button>

            <Modal show={show} onHide={handleClose} centered dialogClassName="sbte-medium-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Keyboard Shortcuts</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <KeyboardShortcutLabel character="o" name="Toggle Play / Pause" />
                    <KeyboardShortcutLabel character="←" name="Seek Back 1 Second" />
                    <KeyboardShortcutLabel character="→" name="Seek Ahead 1 Second" />
                    <KeyboardShortcutLabel character="↑" name="Set Caption Start Time" />
                    <KeyboardShortcutLabel character="↓" name="Set Caption End Time" />
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
