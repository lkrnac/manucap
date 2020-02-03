import "../testUtils/initBrowserEnvironment";
import * as shortcuts from "../utils/shortcutConstants";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import KeyboardShortcuts from "./KeyboardShortcuts";
import Modal from "react-bootstrap/Modal";
import { Provider } from "react-redux";
import React from "react";
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import testingStore from "../testUtils/testingStore";

describe("KeyboardShortcuts", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <button
                    type="button"
                    className="dotsub-keyboard-shortcuts-button btn btn-light"
                >
                    Keyboard Shortcuts
                </button>
                <div className="fade modal-backdrop show" />
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fade modal show"
                    tabIndex={-1}
                    style={{ display: "block" }}
                >
                    <div role="document" className="modal-dialog sbte-medium-modal modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title h4">Keyboard Shortcuts</div>
                                <button type="button" className="close">
                                    <span aria-hidden="true">×</span>
                                    <span className="sr-only">Close</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <h5><span className="badge badge-secondary">Ctrl</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Shift</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">o</span></h5>
                                    <span>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Alt</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Shift</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">o</span></h5>
                                    <span>&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;</span>
                                    <span>Toggle Play / Pause</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center" }}><h5>
                                    <span className="badge badge-secondary">Ctrl</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Shift</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">←</span></h5>
                                    <span>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Alt</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Shift</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">←</span></h5>
                                    <span>&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;</span>
                                    <span>Seek Back 1 Second</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <h5><span className="badge badge-secondary">Ctrl</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Shift</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">→</span></h5>
                                    <span>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Alt</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Shift</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">→</span></h5>
                                    <span>&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;</span>
                                    <span>Seek Ahead 1 Second</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <h5><span className="badge badge-secondary">Ctrl</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Shift</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">↑</span></h5>
                                    <span>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Alt</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Shift</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">↑</span></h5>
                                    <span>&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;</span>
                                    <span>Set Caption Start Time</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <h5><span className="badge badge-secondary">Ctrl</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Shift</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">↓</span></h5>
                                    <span>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Alt</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">Shift</span></h5>
                                    <span>&nbsp;+&nbsp;</span>
                                    <h5><span className="badge badge-secondary">↓</span></h5>
                                    <span>&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;</span>
                                    <span>Set Caption End Time</span>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
            )
        ;

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <KeyboardShortcuts />
            </Provider>
        );
        actualNode.find("button.dotsub-keyboard-shortcuts-button").simulate("click");

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

    it("opens keyboard shortcuts modal when button is clicked", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <KeyboardShortcuts />
            </Provider>
        );

        // WHEN
        actualNode.find("button.dotsub-keyboard-shortcuts-button").simulate("click");

        // THEN
        expect(actualNode.find(Modal).props().show).toEqual(true);
    });

    it("closes keyboard shortcuts modal when X button is clicked", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <KeyboardShortcuts />
            </Provider>
        );

        // WHEN
        actualNode.find("button.dotsub-keyboard-shortcuts-button").simulate("click");
        actualNode.find("button.close").simulate("click");
        actualNode.update();

        // THEN
        expect(actualNode.find(Modal).props().show).toEqual(false);
    });

    it("closes keyboard shortcuts modal when close button is clicked", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <KeyboardShortcuts />
            </Provider>
        );

        // WHEN
        actualNode.find("button.dotsub-keyboard-shortcuts-button").simulate("click");
        actualNode.find(".modal-footer .btn-primary").simulate("click");
        actualNode.update();

        // THEN
        expect(actualNode.find(Modal).props().show).toEqual(false);
    });

    it("opens keyboard shortcuts modal on keyboard shortcut", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <KeyboardShortcuts />
            </Provider>
        );

        // WHEN
        act(() => {
            simulant.fire(
                document.documentElement, "keydown", { keyCode: shortcuts.SLASH_CHAR, shiftKey: true, altKey: true });
        });
        actualNode.update();

        // THEN
        expect(actualNode.find(Modal).props().show).toEqual(true);
    });

    it("closes keyboard shortcuts modal on keyboard shortcut", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <KeyboardShortcuts />
            </Provider>
        );

        // WHEN
        actualNode.find("button.dotsub-keyboard-shortcuts-button").simulate("click");
        act(() => {
            simulant.fire(
                document.documentElement, "keydown", { keyCode: shortcuts.SLASH_CHAR, shiftKey: true, altKey: true });
        });
        actualNode.update();

        // THEN
        expect(actualNode.find(Modal).props().show).toEqual(false);
    });
});
