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

    it("fills characterBindings with values", () => {
        //THEN
        //@ts-ignore the IDE reports some misleading error on the key type
        Object.values(Character).forEach((key: Character) => {
            //@ts-ignore for some reason tslint fails for includes
            expect(Array.from(characterBindings.keys()).includes(key));
        });
    });

    it("fills mousetrapBindings with values", () => {
        //THEN
        Object.values(KeyCombination).forEach((key: KeyCombination) => {
            //@ts-ignore for some reason tslint fails for includes
            expect(Array.from(mousetrapBindings.values()).includes(key));
        });
    });

    describe("getActionByKeyboardEvent", () => {

        it("gets action from getActionByKeyboardEvent", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true, keyCode: Character.O_CHAR };

            //WHEN
            //@ts-ignore
            const action = getActionByKeyboardEvent(event);

            //THEN
            expect(action).toEqual("togglePlayPause");
        });

        it("returns undefined if one of the action keys is not clicked", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true, keyCode: Character.O_CHAR };

            //WHEN
            event.shiftKey = false;
            //@ts-ignore
            const action = getActionByKeyboardEvent(event);

            //THEN
            expect(action).toBeUndefined;
        });

        it("returns undefined if keycode is not defined by characterBindings", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true, keyCode: Character.O_CHAR };

            //WHEN
            event.keyCode = 33;
            //@ts-ignore
            const action = getActionByKeyboardEvent(event);

            //THEN
            expect(action).toBeUndefined;
        });

    });

    describe("triggerMouseTrapAction", () => {
        const mouseTrapTriggerSpy = jest.spyOn(Mousetrap, "trigger");
        beforeEach(()=>{
            mouseTrapTriggerSpy.mockReset();
        });
        it("triggers mousetrap action", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true, keyCode: Character.O_CHAR };

            //WHEN
            //@ts-ignore
            triggerMouseTrapAction(event);

            //THEN
            expect(mouseTrapTriggerSpy).toBeCalled;
        });

        it("does not trigger mousetrap action if one of the action keys is not clicked", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true, keyCode: Character.O_CHAR };

            //WHEN
            event.shiftKey = false;
            //@ts-ignore
            triggerMouseTrapAction(event);

            //THEN
            expect(mouseTrapTriggerSpy).not.toBeCalled();
        });

        it("does not trigger mousetrap action if keycode is not defined by characterBindings", () => {
            //GIVEN
            const event = { shiftKey: true, metaKey: true, keyCode: Character.O_CHAR };

            //WHEN
            event.keyCode = 33;
            //@ts-ignore
            triggerMouseTrapAction(event);

            //THEN
            expect(mouseTrapTriggerSpy).not.toBeCalled();
        });

    });

});
