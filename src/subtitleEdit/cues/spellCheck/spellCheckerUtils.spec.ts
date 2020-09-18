import "../../../testUtils/initBrowserEnvironment";
import { Constants } from "../../constants";
import { addIgnoredKeyword, generateSpellcheckHash, hasIgnoredKeyword } from "./spellCheckerUtils";
import { Match, Replacement } from "./model";

describe("spellCheckerUtils", () => {
    const trackId = "0fd7af04-6c87-4793-8d66-fdb19b5fd04d";
    const ruleId = "MORFOLOGIK_RULE_EN_US";

    describe("containsIgnoredKeyword", () => {
        it("returns true if it contains keyword generated hash", () => {
            //GIVEN
            const match = { offset: 8, length: 13, replacements: [] as Replacement[],
                context: { text: "this is falsex", offset: 2, length: 13 },
                rule: { id: ruleId }} as Match;

            localStorage.setItem(Constants.SPELLCHECKER_IGNORES_LOCAL_STORAGE_KEY,
                "{\"0fd7af04-6c87-4793-8d66-fdb19b5fd04d\":{\"hashes\":[\"21db4a58c10774db9f1b4802f89c380c\"]," +
                "\"creationDate\":\"2020-09-15T02:25:14.756Z\"}}");

            //WHEN
            const containsIgnoredKeyword = hasIgnoredKeyword(trackId, match);

            //THEN
            expect(containsIgnoredKeyword).toBeTruthy();
        });

        it("returns false if it does not contain the keyword generated hash", () => {
            //GIVEN
            const match = { offset: 8, length: 5, replacements: [] as Replacement[],
                context: { text: "this is falsex", offset: 8, length: 5 },
                rule: { id: ruleId }} as Match;

            localStorage.setItem(Constants.SPELLCHECKER_IGNORES_LOCAL_STORAGE_KEY,
                "{\"0fd7af04-6c87-4793-8d66-fdb19b5fd04d\":{\"hashes\":[\"21db4a58c10774db9f1b4802f89c380c\"]," +
                "\"creationDate\":\"2020-09-15T02:25:14.756Z\"}}");

            //WHEN
            const containsIgnoredKeyword = hasIgnoredKeyword(trackId, match);

            //THEN
            expect(containsIgnoredKeyword).toBeFalsy();
        });
    });

    describe("addIgnoredKeyword", () => {
        it("creates track entry and add generated hash to it", () => {
            //WHEN
            const keyword = "falsex";
            const expectedHash = generateSpellcheckHash(keyword,ruleId);
            addIgnoredKeyword(trackId, keyword, ruleId);

            //THEN
            //@ts-ignore there is always a value returned by get item
            const ignores = JSON.parse(localStorage.getItem(Constants.SPELLCHECKER_IGNORES_LOCAL_STORAGE_KEY));
            expect(ignores[trackId].hashes).toContain(expectedHash);
            const creationDate = new Date(ignores[trackId].creationDate);
            expect(creationDate.getTime()).toBeLessThan(new Date().getTime());
        });

        it("append new ignored keyword hash to already created track entry", () => {
            const newKeyword = "bumbum";
            const expectedHash = generateSpellcheckHash(newKeyword,ruleId);

            localStorage.setItem(Constants.SPELLCHECKER_IGNORES_LOCAL_STORAGE_KEY,
                "{\"0fd7af04-6c87-4793-8d66-fdb19b5fd04d\":{\"hashes\":[\"21db4a58c10774db9f1b4802f89c380c\"]," +
                "\"creationDate\":\"2020-09-15T02:25:14.756Z\"}}");

            //WHEN
            addIgnoredKeyword(trackId, newKeyword, ruleId);

            //THEN
            //@ts-ignore there is always a value returned by get item
            const ignores = JSON.parse(localStorage.getItem(Constants.SPELLCHECKER_IGNORES_LOCAL_STORAGE_KEY));
            expect(ignores[trackId].hashes.length).toEqual(2);
            expect(ignores[trackId].hashes).toContain(expectedHash);
            const creationDate = new Date(ignores[trackId].creationDate);
            expect(creationDate.getTime()).toBeLessThan(new Date().getTime());
        });
    });

    describe("generateSpellcheckHash", () => {
        it("creates a hash for the gives parameters", () => {
            //GIVEN
            const keyword = "falsex";

            //WHEN
            const expectedHash = generateSpellcheckHash(keyword,ruleId);

            //THEN
            expect(expectedHash).toEqual("21db4a58c10774db9f1b4802f89c380c");
        });

        it("returns same hash if called different times with same parameters", () => {
            //WHEN
            const keyword = "falsex";
            const expectedHash = generateSpellcheckHash(keyword,ruleId);

            //WHEN
            const hash1 = generateSpellcheckHash(keyword,ruleId);
            const hash2 = generateSpellcheckHash(keyword,ruleId);

            //THEN
            expect(hash1).toEqual(expectedHash);
            expect(hash2).toEqual(expectedHash);
        });

    });
});
