import {
    Character,
    characterBindings,
    getActionByKeyboardEvent,
    KeyCombination,
    mousetrapBindings,
    triggerMouseTrapAction
} from "./shortcutConstants";
import Mousetrap from "mousetrap";


describe("shortcutConstants.spec", () => {

    it("fills characterBindings with Character as keys", () => {
        //THEN
        Array.from(characterBindings.keys()).forEach((key: Character) => {
            expect(Object.values(Character).includes(key));
        });
    });

    it("fills mousetrapBindings with KeyCombination as values", () => {
        //THEN
        Array.from(mousetrapBindings.values()).forEach((value: KeyCombination) => {
            expect(Object.values(KeyCombination).includes(value));
        });
    });

    describe("getActionByKeyboardEvent", () => {

        it("gets action from getActionByKeyboardEvent", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true, keyCode: Character.O_CHAR };

            //WHEN
            //@ts-ignore since KB event is created manually
            const action = getActionByKeyboardEvent(event);

            //THEN
            expect(action).toEqual("togglePlayPause");
        });

        it("returns undefined if one of the action keys is not clicked", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true, keyCode: Character.O_CHAR };

            //WHEN
            event.shiftKey = false;
            //@ts-ignore since KB event is created manually
            const action = getActionByKeyboardEvent(event);

            //THEN
            expect(action).toBeUndefined;
        });

        it("returns undefined if keycode is not defined by characterBindings", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true, keyCode: Character.O_CHAR };

            //WHEN
            event.keyCode = 33;
            //@ts-ignore since KB event is created manually
            const action = getActionByKeyboardEvent(event);

            //THEN
            expect(action).toBeUndefined;
        });

    });

    describe("triggerMouseTrapAction", () => {
        const mouseTrapTriggerSpy = jest.spyOn(Mousetrap, "trigger");
        beforeEach(() => {
            mouseTrapTriggerSpy.mockReset();
        });

        test.each(Object.values(Character))(
            "triggers mousetrap action when the input is %s",
            (char: Character | string) => {
                //GIVEN
                const event = { shiftKey: true, metaKey: true, keyCode: char };

                //WHEN
                //@ts-ignore since KB event is created manually
                triggerMouseTrapAction(event);

                //THEN
                expect(mouseTrapTriggerSpy).toBeCalled;            },
        );

        it("does not trigger mousetrap action if one of the action keys is not clicked", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true, keyCode: Character.O_CHAR };

            //WHEN
            event.shiftKey = false;
            //@ts-ignore since KB event is created manually
            triggerMouseTrapAction(event);

            //THEN
            expect(mouseTrapTriggerSpy).not.toBeCalled();
        });

        it("does not trigger mousetrap action if keycode is not defined by characterBindings", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true, keyCode: Character.O_CHAR };

            //WHEN
            event.keyCode = 33;
            //@ts-ignore since KB event is created manually
            triggerMouseTrapAction(event);

            //THEN
            expect(mouseTrapTriggerSpy).not.toBeCalled();
        });

    });

});
