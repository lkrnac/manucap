import "../../../testUtils/initBrowserEnvironment";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import { Character } from "../../utils/shortcutConstants";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { Provider } from "react-redux";
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";
import { removeHeadlessAttributes } from "../../../testUtils/testUtils";
import TransitionDialog from "../../common/TransitionDialog";

describe("KeyboardShortcuts", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <button className="dotsub-keyboard-shortcuts-button tw-dropdown-item">
                    Keyboard Shortcuts
                </button>
                <div
                    className="tw-fixed tw-z-200 tw-inset-0 tw-overflow-y-auto tw-modal sbte-medium-modal"
                    id=""
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby=""
                    aria-describedby=""
                >
                    <div
                        className="tw-fixed tw-inset-0 tw-bg-black tw-ease-out tw-duration-300 tw-opacity-0"
                        id=""
                        aria-hidden="true"
                    />
                    <div className="tw-flex tw-items-center tw-justify-center tw-p-6 tw-min-h-screen">
                        <div
                            className="tw-relative tw-max-w-2xl tw-w-full tw-mx-auto tw-shadow-2xl tw-modal-content
                                tw-max-w-4xl tw-ease-out tw-duration-300 tw-opacity-0 tw--translate-y-32"
                        >
                            <button
                                type="button"
                                className="tw-modal-close"
                            >
                                <span aria-hidden="true">×</span>
                                <span className="sr-only">Close</span>
                            </button>
                            <div className="tw-modal-header tw-modal-header-primary">
                                <h4 id="">Keyboard Shortcuts</h4>
                            </div>
                            <div
                                className="tw-modal-description"
                                id=""
                            >
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
                                <div className="tw-modal-toolbar">
                                    <button className="btn btn-primary">Close</button>
                                </div>
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
        const actual = removeHeadlessAttributes(actualNode.html());
        const expected = removeHeadlessAttributes(expectedNode.html());
        expect(actual).toEqual(expected);
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
        expect(actualNode.find(TransitionDialog).props().open).toEqual(true);
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
        actualNode.find(".tw-modal-close").simulate("click");
        actualNode.update();

        // THEN
        expect(actualNode.find(TransitionDialog).props().open).toEqual(false);
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
        actualNode.find(".tw-modal-toolbar .btn-primary").simulate("click");
        actualNode.update();

        // THEN
        expect(actualNode.find(TransitionDialog).props().open).toEqual(false);
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
        expect(actualNode.find(TransitionDialog).props().open).toEqual(true);
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
        expect(actualNode.find(TransitionDialog).props().open).toEqual(false);
    });
});
