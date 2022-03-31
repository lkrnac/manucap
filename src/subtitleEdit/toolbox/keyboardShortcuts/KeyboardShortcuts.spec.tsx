import "../../../testUtils/initBrowserEnvironment";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import { Character } from "../../utils/shortcutConstants";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";

describe("KeyboardShortcuts", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <button className="dotsub-keyboard-shortcuts-button">
                Keyboard Shortcuts
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <KeyboardShortcuts show setShow={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("calls setShow with opposite value of show", () => {
        // GIVEN
        const setShow = jest.fn();

        // WHEN
        mount(
            <Provider store={testingStore}>
                <KeyboardShortcuts show setShow={setShow} />
            </Provider>
        );

        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.SLASH_CHAR, shiftKey: true, altKey: true });

        // THEN
        expect(setShow).toHaveBeenCalledWith(false);
    });
});
