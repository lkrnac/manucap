import "../../../testUtils/initBrowserEnvironment";

// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";
import Icon from "@mdi/react";
import { mdiKeyboard } from "@mdi/js";

import { Character } from "../../utils/shortcutConstants";
import testingStore from "../../../testUtils/testingStore";
import KeyboardShortcuts from "./KeyboardShortcuts";

describe("KeyboardShortcuts", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button className="mc-keyboard-shortcuts-button flex items-center">
                <Icon path={mdiKeyboard} size={1.25} />
                <span className="pl-4">Keyboard Shortcuts</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <KeyboardShortcuts show setShow={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("calls setShow with opposite value of show", () => {
        // GIVEN
        const setShow = jest.fn();

        render(
            <Provider store={testingStore}>
                <KeyboardShortcuts show setShow={setShow} />
            </Provider>
        );

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.SLASH_CHAR, shiftKey: true, altKey: true });

        // THEN
        expect(setShow).toHaveBeenCalledWith(false);
    });

    it("calls setShow with true on button click", () => {
        // GIVEN
        const setShow = jest.fn();

        const { container } = render(
            <Provider store={testingStore}>
                <KeyboardShortcuts show setShow={setShow} />
            </Provider>
        );

        // WHEN
        fireEvent.click(container.querySelector("button") as Element);

        // THEN
        expect(setShow).toHaveBeenCalledWith(true);
    });
});
