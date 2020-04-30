import "../testUtils/initBrowserEnvironment";
import { getShortcutAsText } from "./shortcutConstants";

describe("getShortcutAsText", () => {
    it("Returns shortcut as a text for the given char", () => {
        //GIVEN, WHEN
        const shortcutAsText = getShortcutAsText("o");

        //THEN
        expect(shortcutAsText).toEqual("Ctrl/Alt + Shift + o");
    });
});
