import "../../../testUtils/initBrowserEnvironment";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import { Character } from "../../utils/shortcutConstants";
import KeyboardShortcuts from "./KeyboardShortcuts";
import Modal from "react-bootstrap/Modal";
import { Provider } from "react-redux";
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";

describe("KeyboardShortcuts", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <button type="button" className="dotsub-keyboard-shortcuts-button btn btn-secondary">
                    <i className="far fa-keyboard" /> Keyboard Shortcuts
                </button>
                <div className="fade modal-backdrop show" />
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fade modal show"
                    tabIndex={-1}
                    style={{ display: "block" }}
                >
                    <div className="modal-dialog sbte-medium-modal modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title h4">Keyboard Shortcuts</div>
                                <button type="button" className="close"><span aria-hidden="true">×</span>
                                    <span className="sr-only">
                                        Close
                                    </span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div style={{ "display": "flex", "alignItems": "center" }}>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Ctrl</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Shift</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">o</span></h4>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <span>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;</span>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Alt</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Shift</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">o</span></h4>
                                        </div>
                                    </div>
                                    <span><span>&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;</span>Toggle Play / Pause</span>
                                </div>
                                <div style={{ "display": "flex", "alignItems": "center" }}>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Ctrl</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Shift</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">k</span></h4>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <span>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;</span>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Alt</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Shift</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">k</span></h4>
                                        </div>
                                    </div>
                                    <span>
                                        <span>&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;
                                        </span>Toggle Play / Pause Current Cue
                                    </span>
                                </div>
                                <div style={{ "display": "flex", "alignItems": "center" }}>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Ctrl</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Shift</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">←</span></h4>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <span>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;</span>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Alt</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Shift</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">←</span></h4>
                                        </div>
                                    </div>
                                    <span><span>&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;</span>Seek Back 1 Second</span>
                                </div>
                                <div style={{ "display":  "flex", "alignItems": "center" }}>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Ctrl</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Shift</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">→</span></h4>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <span>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;</span>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Alt</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Shift</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">→</span></h4>
                                        </div>
                                    </div>
                                    <span><span>&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;</span>Seek Ahead 1 Second</span>
                                </div>
                                <div style={{ "display":  "flex", "alignItems": "center" }}>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Ctrl</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Shift</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">↑</span></h4>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <span>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;</span>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Alt</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Shift</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">↑</span></h4>
                                        </div>
                                    </div>
                                    <span><span>&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;</span>Set Cue Start Time</span>
                                </div>
                                <div style={{ "display":  "flex", "alignItems": "center" }}>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Ctrl</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Shift</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">↓</span></h4>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <span>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;</span>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Alt</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Shift</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">↓</span></h4>
                                        </div>
                                    </div>
                                    <span><span>&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;</span>Set Cue End Time</span>
                                </div>
                                <div style={{ "display":  "flex", "alignItems": "center" }}>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Ctrl</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Shift</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Esc</span></h4>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <span>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;</span>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Alt</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Shift</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Esc</span></h4>
                                        </div>
                                    </div>
                                    <span><span>&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;</span>Edit Previous Cue</span>
                                </div>
                                <div style={{ "display":  "flex", "alignItems": "center" }}>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Ctrl</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Shift</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Space</span></h4>
                                    </div>
                                    <div className="d-none align-items-center justify-content-center">
                                        <span>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;</span>
                                        <div className="d-none align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Alt</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Shift</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Space</span></h4>
                                        </div>
                                    </div>
                                    <span>
                                        <span>&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;
                                        </span>Show a spelling error [You must be stepping on
                                        an spelling error word]
                                    </span>
                                </div>
                                <div style={{ "display":  "flex", "alignItems": "center" }}>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Ctrl</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">Shift</span></h4>
                                        <span>&nbsp;+&nbsp;</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h4><span className="badge badge-secondary">b</span></h4>
                                    </div>
                                    <div className="d-none align-items-center justify-content-center">
                                        <span>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;</span>
                                        <div className="d-none align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Alt</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">Shift</span></h4>
                                            <span>&nbsp;+&nbsp;</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h4><span className="badge badge-secondary">b</span></h4>
                                        </div>
                                    </div>
                                    <span>
                                        <span>&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;
                                        </span>Insert bidirectional text control code
                                    </span>
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
        expect(actualNode.html()).toEqual(expectedNode.html());
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
                document.documentElement, "keydown", { keyCode: Character.SLASH_CHAR, shiftKey: true, altKey: true });
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
                document.documentElement, "keydown", { keyCode: Character.SLASH_CHAR, shiftKey: true, altKey: true });
        });
        actualNode.update();

        // THEN
        expect(actualNode.find(Modal).props().show).toEqual(false);
    });
});
