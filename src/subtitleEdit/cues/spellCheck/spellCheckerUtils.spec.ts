import "../../../testUtils/initBrowserEnvironment";
import { Constants } from "../../constants";
import { addIgnoredKeyword, generateSpellcheckHash, hasIgnoredKeyword } from "./spellCheckerUtils";

describe("spellCheckerUtils", () => {
    const trackId = "0fd7af04-6c87-4793-8d66-fdb19b5fd04d";
    const cueId = "b3fd447e-513d-4328-ada9-c96a19d684e1";
    const ruleId = "MORFOLOGIK_RULE_EN_US";

    describe("containsIgnoredKeyword", () => {
        it("returns true if it contains keyword generated hash", () => {
            //GIVEN
            localStorage.setItem(Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY,
                "{\"0fd7af04-6c87-4793-8d66-fdb19b5fd04d\":{\"hashes\":[\"0dfa33734505a24a72c18909ace7cb96\"]," +
                "\"creationDate\":\"2020-09-15T02:25:14.756Z\"}}");

            //WHEN
            const containsIgnoredKeyword = hasIgnoredKeyword(trackId, cueId, "falsex", ruleId);

            //THEN
            expect(containsIgnoredKeyword).toBeTruthy();
        });

        it("returns false if it does not contain the keyword generated hash", () => {
            //GIVEN
            localStorage.setItem(Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY,
                "{\"0fd7af04-6c87-4793-8d66-fdb19b5fd04d\":{\"hashes\":[\"0dfa33734505a24a72c18909ace7cb96\"]," +
                "\"creationDate\":\"2020-09-15T02:25:14.756Z\"}}");

            //WHEN
            const containsIgnoredKeyword = hasIgnoredKeyword(trackId, cueId, "XXfalsex", ruleId);

            //THEN
            expect(containsIgnoredKeyword).toBeFalsy();
        });
    });

    describe("addIgnoredKeyword", () => {
        it("creates track entry and add generated hash to it", () => {
            //WHEN
            const keyword = "falsex";
            const expectedHash = generateSpellcheckHash(cueId, keyword,ruleId);
            addIgnoredKeyword(trackId, cueId, keyword, ruleId);

            //THEN
            //@ts-ignore there is always a value returned by get item
            const ignores = JSON.parse(localStorage.getItem(Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY));
            expect(ignores[trackId].hashes).toContain(expectedHash);
            const creationDate = new Date(ignores[trackId].creationDate);
            expect(creationDate.getTime()).toBeLessThan(new Date().getTime());
        });

        it("append new ignored keyword hash to already created track entry", () => {
            const newKeyword = "bumbum";
            const expectedHash = generateSpellcheckHash(cueId, newKeyword,ruleId);

            localStorage.setItem(Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY,
                "{\"0fd7af04-6c87-4793-8d66-fdb19b5fd04d\":{\"hashes\":[\"0dfa33734505a24a72c18909ace7cb96\"]," +
                "\"creationDate\":\"2020-09-15T02:25:14.756Z\"}}");

            //WHEN
            addIgnoredKeyword(trackId, cueId, newKeyword, ruleId);

            //THEN
            //@ts-ignore there is always a value returned by get item
            const ignores = JSON.parse(localStorage.getItem(Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY));
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
            const expectedHash = generateSpellcheckHash(cueId, keyword,ruleId);

            //THEN
            expect(expectedHash).toEqual("0dfa33734505a24a72c18909ace7cb96");
        });

        it("returns same hash if called different times with same parameters", () => {
            //WHEN
            const keyword = "falsex";
            const expectedHash = generateSpellcheckHash(cueId, keyword,ruleId);

            //WHEN
            const hash1 = generateSpellcheckHash(cueId, keyword,ruleId);
            const hash2 = generateSpellcheckHash(cueId, keyword,ruleId);

            //THEN
            expect(hash1).toEqual(expectedHash);
            expect(hash2).toEqual(expectedHash);
        });

    });
});
