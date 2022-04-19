import "../../../testUtils/initBrowserEnvironment";
import KeyboardShortcutLabel from "./KeyboardShortcutLabel";
import { mount } from "enzyme";
import { os } from "platform";
import { Provider } from "react-redux";
import testingStore from "../../../testUtils/testingStore";


describe("KeyboardShortcutLabel", () => {
    it("renders", () => {
        // GIVEN
        const commandKey = os && os.family === "OS X" ? "Command" : "Ctrl";
        const expectedNode = mount(
            <div style={{ display: "flex", alignItems: "center" }}>
                <div className="tw-flex tw-items-center tw-justify-center">
                    <h4><span className="tw-badge tw-badge-secondary">{commandKey}</span></h4>
                    <span>&#160;+&#160;</span>
                </div>
                <div className="tw-flex tw-items-center tw-justify-center">
                    <h4><span className="tw-badge tw-badge-secondary">Shift</span></h4>
                    <span>&#160;+&#160;</span>
                </div>
                <div className="tw-flex tw-items-center tw-justify-center">
                    <h4><span className="tw-badge tw-badge-secondary">o</span></h4>
                </div>
                <div className="tw-flex tw-items-center tw-justify-center">
                    <span>&#160;&#160;&#160;or&#160;&#160;&#160;</span>
                    <div className="tw-flex tw-items-center tw-justify-center">
                        <h4><span className="tw-badge tw-badge-secondary">Alt</span></h4>
                        <span>&#160;+&#160;</span>
                    </div>
                    <div className="tw-flex tw-items-center tw-justify-center">
                        <h4><span className="tw-badge tw-badge-secondary">Shift</span></h4>
                        <span>&#160;+&#160;</span>
                    </div>
                    <div className="tw-flex tw-items-center tw-justify-center">
                        <h4><span className="tw-badge tw-badge-secondary">o</span></h4>
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
        const actualNode = mount(
            <Provider store={testingStore}>
                <KeyboardShortcutLabel character="o" name="Toggle Play / Pause" />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("hide buttons if passed hide flags", () => {
        // GIVEN
        const commandKey = os && os.family === "OS X" ? "Command" : "Ctrl";
        const expectedNode = mount(
            <div style={{ display: "flex", alignItems: "center" }}>
                <div className="tw-hidden tw-items-center tw-justify-center">
                    <h4><span className="tw-badge tw-badge-secondary">{commandKey}</span></h4>
                    <span>&#160;+&#160;</span>
                </div>
                <div className="tw-hidden tw-items-center tw-justify-center">
                    <h4><span className="tw-badge tw-badge-secondary">Shift</span></h4>
                    <span>&#160;+&#160;</span>
                </div>
                <div className="tw-flex tw-items-center tw-justify-center">
                    <h4><span className="tw-badge tw-badge-secondary">o</span></h4>
                </div>
                <div className="tw-hidden tw-items-center tw-justify-center">
                    <span>&#160;&#160;&#160;or&#160;&#160;&#160;</span>
                    <div className="tw-hidden tw-items-center tw-justify-center">
                        <h4><span className="tw-badge tw-badge-secondary">Alt</span></h4>
                        <span>&#160;+&#160;</span>
                    </div>
                    <div className="tw-hidden tw-items-center tw-justify-center">
                        <h4><span className="tw-badge tw-badge-secondary">Shift</span></h4>
                        <span>&#160;+&#160;</span>
                    </div>
                    <div className="tw-flex tw-items-center tw-justify-center">
                        <h4><span className="tw-badge tw-badge-secondary">o</span></h4>
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
        const actualNode = mount(
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
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
});
