import "../testUtils/initBrowserEnvironment";
import Button from "react-bootstrap/Button";
import KeyboardShortcutLabel from "./KeyboardShortcutLabel";
import KeyboardShortcuts from "./KeyboardShortcuts";
import Modal from "react-bootstrap/Modal";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import testingStore from "../testUtils/testingStore";

describe("KeyboardShortcuts", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <div>
                <Button variant="light" className="dotsub-keyboard-shortcuts-button">
                    Keyboard Shortcuts
                </Button>

                <Modal centered dialogClassName="sbte-medium-modal">
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
        const actualNode = mount(
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
        const actualNode = mount(
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
