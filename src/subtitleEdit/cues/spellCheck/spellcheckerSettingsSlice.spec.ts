import { AnyAction } from "@reduxjs/toolkit";
import testingStore from "../../../testUtils/testingStore";
import { setSpellCheckDomain, spellcheckerSettingsSlice } from "../../spellcheckerSettingsSlice";

describe("spellCheckSlices", () => {

    describe("initial values", () => {
        it("init object with default values", () => {
            //GIVEN
            const expectedSpellcheckerSettings = { "domain": null, "enabled": false };

            //THEN
            expect(testingStore.getState().spellCheckerSettings).toEqual(expectedSpellcheckerSettings);
        });
    });


    describe("setSpellCheckerDomain", () => {
        it("sets spell check domain", () => {
            // WHEN
            testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().spellCheckerSettings.domain).toEqual("testing-domain");
            expect(testingStore.getState().spellCheckerSettings.enabled).toEqual(true);
        });
    });

    describe("disableSpellchecker", () => {
        it("sets spellcheckerDisabled to true when calling", () => {
            //GIVEN
            testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);

            // WHEN
            testingStore.dispatch(spellcheckerSettingsSlice.actions.disableSpellchecker() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().spellCheckerSettings.enabled).toEqual(false);
        });
    });

});
