import "../../../testUtils/initBrowserEnvironment";
import KeyboardShortcutLabel from "./KeyboardShortcutLabel";
import { os } from "platform";
import { Provider } from "react-redux";
import testingStore from "../../../testUtils/testingStore";
import { render } from "@testing-library/react";


describe("KeyboardShortcutLabel", () => {
    it("renders", () => {
        // GIVEN
        const commandKey = os && os.family === "OS X" ? "Command" : "Ctrl";
        const expectedNode = render(
            <div style={{ display: "flex", alignItems: "center" }}>
                <div className="flex items-center justify-center">
                    <h4 className="m-0">
                        <span className="mc-keyboard-label">
                            {commandKey}
                        </span>
                    </h4>
                    <span>&#160;+&#160;</span>
                </div>
                <div className="flex items-center justify-center">
                    <h4 className="m-0">
                        <span className="mc-keyboard-label">
                            Shift
                        </span>
                    </h4>
                    <span>&#160;+&#160;</span>
                </div>
                <div className="flex items-center justify-center">
                    <h4 className="m-0">
                        <span className="mc-keyboard-label">
                            o
                        </span>
                    </h4>
                </div>
                <div className="flex items-center justify-center">
                    <span>&#160;&#160;&#160;or&#160;&#160;&#160;</span>
                    <div className="flex items-center justify-center">
                        <h4 className="m-0">
                            <span className="mc-keyboard-label">
                                Alt
                            </span>
                        </h4>
                        <span>&#160;+&#160;</span>
                    </div>
                    <div className="flex items-center justify-center">
                        <h4 className="m-0">
                            <span className="mc-keyboard-label">
                                Shift
                            </span>
                        </h4>
                        <span>&#160;+&#160;</span>
                    </div>
                    <div className="flex items-center justify-center">
                        <h4 className="m-0">
                            <span className="mc-keyboard-label">
                                o
                            </span>
                        </h4>
                    </div>
                </div>
                <span>
                    <span>
                        &nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;
                    </span>Toggle Play / Pause
                </span>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <KeyboardShortcutLabel character="o" name="Toggle Play / Pause" />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("hide buttons if passed hide flags", () => {
        // GIVEN
        const commandKey = os && os.family === "OS X" ? "Command" : "Ctrl";
        const expectedNode = render(
            <div style={{ display: "flex", alignItems: "center" }}>
                <div className="hidden items-center justify-center">
                    <h4 className="m-0">
                        <span className="mc-keyboard-label">
                            {commandKey}
                        </span>
                    </h4>
                    <span>&#160;+&#160;</span>
                </div>
                <div className="hidden items-center justify-center">
                    <h4 className="m-0">
                        <span className="mc-keyboard-label">
                            Shift
                        </span>
                    </h4>
                    <span>&#160;+&#160;</span>
                </div>
                <div className="flex items-center justify-center">
                    <h4 className="m-0">
                        <span className="mc-keyboard-label">
                            o
                        </span>
                    </h4>
                </div>
                <div className="hidden items-center justify-center">
                    <span>&#160;&#160;&#160;or&#160;&#160;&#160;</span>
                    <div className="hidden items-center justify-center">
                        <h4 className="m-0">
                            <span className="mc-keyboard-label">
                                Alt
                            </span>
                        </h4>
                        <span>&#160;+&#160;</span>
                    </div>
                    <div className="hidden items-center justify-center">
                        <h4 className="m-0">
                            <span className="mc-keyboard-label">
                                Shift
                            </span>
                        </h4>
                        <span>&#160;+&#160;</span>
                    </div>
                    <div className="flex items-center justify-center">
                        <h4 className="m-0">
                            <span className="mc-keyboard-label">
                                o
                            </span>
                        </h4>
                    </div>
                </div>
                <span>
                    <span>
                        &nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;
                    </span>Toggle Play / Pause
                </span>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <KeyboardShortcutLabel
                    hideAlternativeKey
                    hideAltKey
                    hideMetaKey
                    hideShiftKey
                    character="o"
                    name="Toggle Play / Pause"
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });
});
