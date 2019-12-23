import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import KeyboardShortcuts from "./KeyboardShortcuts";
import KeyboardShortcutLabel from "./KeyboardShortcutLabel";

describe("KeyboardShortcuts", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = enzyme.mount(
            <div>
                <Button variant="primary" className="dotsub-keyboard-shortcuts-button">
                    Keyboard Shortcuts
                </Button>

                <Modal centered dialogClassName="keyboard-modal">
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
                        <Button variant="primary">
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );

        // WHEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore} >
                <KeyboardShortcuts />
            </Provider>
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

    it("opens keyboard shortcuts modal when button is clicked", () => {
        // GIVEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore} >
                <KeyboardShortcuts />
            </Provider>
        );

        // WHEN
        actualNode.find("button.dotsub-keyboard-shortcuts-button").simulate("click");

        // THEN
        expect(actualNode.find(Modal).props().show).toEqual(true);
    });
});
