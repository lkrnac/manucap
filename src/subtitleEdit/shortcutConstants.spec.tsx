import "../testUtils/initBrowserEnvironment";
import { getShortcutAsText } from "./shortcutConstants";
import { os } from "platform";

describe("getShortcutAsText", () => {
    it("Returns shortcut as a text for the given char", () => {
        //GIVEN
        const commandKey = os && os.family === "OS X" ? "Command" : "Ctrl";

        // WHEN
        const shortcutAsText = getShortcutAsText("o");

        //THEN
        expect(shortcutAsText).toEqual(commandKey + "/Alt + Shift + o");
    });
});
