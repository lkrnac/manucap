import { AnyAction } from "@reduxjs/toolkit";
import testingStore from "../../../testUtils/testingStore";
import { setSpellCheckDomain } from "./spellCheckSlices";

describe("spellCheckSlices", () => {
    describe("setSpellCheckerDomain", () => {
        it("sets spell check domain", () => {
            // WHEN
            testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().spellCheckerDomain).toEqual("testing-domain");
        });
    });

});
