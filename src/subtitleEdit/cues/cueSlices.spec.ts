import "video.js"; // VTTCue definition
import { EditorState } from "draft-js";
import { AnyAction } from "@reduxjs/toolkit";
import deepFreeze from "deep-freeze";
import { v4 as uuidv4 } from "uuid";

import {
    addCue,
    applyShiftTime,
    deleteCue,
    setValidationError,
    syncCues,
    updateCueCategory,
    updateCues,
    updateEditingCueIndex,
    updateSourceCues,
    updateVttCue,
    validateCorruptedCues,
} from "./cueSlices";
import { CueDto, ScrollPosition, Track } from "../model";
import { createTestingStore } from "../../testUtils/testingStore";
import { updateEditorState } from "./edit/editorStatesSlice";
import { SubtitleSpecification } from "../toolbox/model";
import { readSubtitleSpecification } from "../toolbox/subtitleSpecificationSlice";
import { resetEditingTrack, updateEditingTrack } from "../trackSlices";
import { Constants } from "../constants";
import { generateSpellcheckHash } from "./spellCheck/spellCheckerUtils";
import { Replacement, SpellCheck } from "./spellCheck/model";
import { setSpellCheckDomain } from "../spellcheckerSettingsSlice";

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
} as Track;

const testingCues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
    {
        vttCue: new VTTCue(4, 6, "Caption Line 3"),
        cueCategory: "ONSCREEN_TEXT",
        spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
    },
] as CueDto[];

const testingCuesWithGaps = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(4, 6, "Caption Line 2"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(12, 18, "Caption Line 3"), cueCategory: "DIALOGUE" },
] as CueDto[];
const ruleId = "MORFOLOGIK_RULE_EN_US";
const ignoredKeyword = "falsex";

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("cueSlices", () => {
    beforeEach(() => testingStore = createTestingStore());
    describe("updateVttCue", () => {
        it("update top level cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const editUuid = testingStore.getState().cues[1].editUuid;

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2.5);
            expect(testingStore.getState().validationError).toEqual(false);
            expect(testingStore.getState().lastCueChange).toBeUndefined;
            expect(testingStore.getState().lastCueChange.index).toEqual(1);
            expect(testingStore.getState().lastCueChange.vttCue.text).toEqual("Dummy Cue");
            expect(testingStore.getState().cues[1].vttCue === testingStore.getState().lastCueChange.vttCue)
                .toBeTruthy();
        });

        it("preserves all other existing cue parameters", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const editUuid = testingStore.getState().cues[2].editUuid;

            // WHEN
            testingStore.dispatch(updateVttCue(2, new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[2].cueCategory).toEqual("ONSCREEN_TEXT");
            expect(testingStore.getState().cues[2].spellCheck)
                .toEqual({ matches: [{ message: "some-spell-check-problem" }]});
        });

        it("doesn't update top level cue when editUuid is different", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateVttCue(1, new VTTCue(2, 2.5, "Dummy Cue"), uuidv4()) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
            expect(testingStore.getState().validationError).toEqual(false);
            expect(testingStore.getState().lastCueChange).toBeUndefined;
        });

        it("doesn't update top level cue when not existing already in the array", () => {
            // WHEN
            testingStore.dispatch(updateVttCue(0, new VTTCue(2, 2.5, "Dummy Cue"), uuidv4()) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues.length).toEqual(0);
            expect(testingStore.getState().validationError).toEqual(false);
            expect(testingStore.getState().lastCueChange).toBeUndefined;
        });

        describe("spell checking", () => {
            const trackId = "0fd7af04-6c87-4793-8d66-fdb19b5fd04d";
            beforeEach(() => {
                localStorage.clear();
                testingStore = createTestingStore();
                jest.clearAllMocks();
            });
            it("updates cues in redux with spell checking state", (done) => {
                // GIVEN
                const testingResponse = {
                    matches: [
                        {
                            message: "This sentence does not start with an uppercase letter",
                            replacements: [{ "value": "Txt" }],
                            "offset": 0,
                            "length": 3,
                            context: { text: "txt", length: 3, offset: 0 },
                            rule: { id: ruleId }
                        },
                        {
                            "message": "Possible spelling mistake found.",
                            "replacements": [
                                { value: "check" },
                                { value: "Chuck" },
                                { value: "chick" },
                                { value: "chuck" },
                                { value: "chock" },
                                { value: "CCK" },
                                { value: "CHC" },
                                { value: "CHK" },
                                { value: "cock" },
                                { value: "ch ck" }
                            ],
                            "offset": 7,
                            "length": 4,
                            context: { text: "text", length: 4, offset: 7 },
                            rule: { id: ruleId }
                        }
                    ]
                };

                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[2].editUuid;

                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementationOnce(() =>
                        new Promise((resolve) => resolve({ json: () => testingResponse, ok: true })));

                // WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                setTimeout(
                    () => {
                        // @ts-ignore modern browsers does have it
                        expect(global.fetch).toBeCalledWith(
                            "https://testing-domain/v2/check",
                            {
                              method: "POST",
                              body: "language=en-US&text=Dummy Cue" +
                                  "&disabledRules=UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END"
                            }
                        );
                        expect(testingStore.getState().cues[2].spellCheck).toEqual(testingResponse);
                        expect(testingStore.getState().cues[2].editUuid).toEqual(editUuid);
                        expect(testingStore.getState().cues[2].corrupted).toBeTruthy();
                        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Dummy Cue");
                        expect(testingStore.getState().cues[2].cueCategory).toEqual("ONSCREEN_TEXT");
                        done();
                    },
                    50
                );
            });

            it("marks cue as corrupted if there are spell check problems", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);

                const editUuid = testingStore.getState().cues[2].editUuid;
                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementationOnce(() =>
                        new Promise((resolve) => resolve({ json: () => ({}), ok: true })));

                // WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[2].corrupted).toBeTruthy();
            });

            it("triggers autosave content is changed", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);

                const editUuid = testingStore.getState().cues[2].editUuid;
                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementationOnce(() =>
                        new Promise((resolve) => resolve({ json: () => ({}), ok: true })));

                // WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledWith(
                    "https://testing-domain/v2/check",
                    {
                      body: "language=en-US&text=Dummy Cue" +
                          "&disabledRules=UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END",
                      method: "POST"
                    }
                );
            });

            test.each([
                ["ar-SA", "ar"], ["ca", "ca-ES"], ["nl-NL", "nl"],
                ["en-IE", "en"], ["fr-FR", "fr"], ["fr-CA", "fr"], ["it-IT", "it"], ["no-NO", "no"],
                ["fa-AF", "fa"], ["fa-IR", "fa"], ["es-ES", "es"], ["es-MX", "es"], ["sv-SE", "sv"]
            ])(
                "calls spellchecker domain with correctly mapped language for %s",
                (vtmsLanguageId: string, languageToolValue: string) => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: vtmsLanguageId }, id: trackId } as Track
                ) as {} as AnyAction);

                const editUuid = testingStore.getState().cues[2].editUuid;
                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementationOnce(() => new Promise((resolve) => resolve({ json: () => ({}), ok: true })));

                // WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledWith(
                    "https://testing-domain/v2/check",
                    {
                        body: `language=${languageToolValue
                        }&text=Dummy Cue&disabledRules=UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END`,
                        method: "POST"
                    }
                );
            });

            test.each([
                ["en-US", "en-US"], ["en-GB", "en-GB"], ["pt-BR", "pt-BR"],
                ["pt-PT", "pt-PT"], ["sk-SK", "sk-SK"], ["ru-RU", "ru-RU"]
            ])(
                "calls spellchecker with VTMS languages codes if language is defined but" +
                " not found in language tool mapper",
                (vtmsLanguageId: string, languageToolValue: string) => {
                    // GIVEN
                    testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                    testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                    testingStore.dispatch(updateEditingTrack(
                        { language: { id: vtmsLanguageId }, id: trackId } as Track
                    ) as {} as AnyAction);

                    const editUuid = testingStore.getState().cues[2].editUuid;
                    // @ts-ignore modern browsers does have it
                    global.fetch = jest.fn()
                        .mockImplementationOnce(() =>
                            new Promise((resolve) => resolve({ json: () => ({}), ok: true })));

                    // WHEN
                    testingStore.dispatch(updateVttCue(2,
                        new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

                    // THEN
                    // @ts-ignore modern browsers does have it
                    expect(global.fetch).toBeCalledWith(
                        "https://testing-domain/v2/check",
                        {
                            body: `language=${languageToolValue
                            }&text=Dummy Cue&disabledRules=UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END`,
                            method: "POST"
                        }
                    );
                });

            it("does not trigger spell check if domain is undefined", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[2].editUuid;
                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementationOnce(() =>
                        new Promise((resolve) => resolve({ json: () => ({}), ok: true })));

                // WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).not.toBeCalled();
            });

            it("does not trigger spell check if language is undefined", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                const editUuid = testingStore.getState().cues[2].editUuid;
                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementationOnce(() => new Promise((resolve) => resolve({ json: () => ({}), ok: true })));

                // WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(2, 2.5, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).not.toBeCalled();
            });

            it("exclude spell check match that matches ignored hash in local storage ", (done) => {
                // GIVEN
                const cues = [
                    {
                        vttCue: new VTTCue(0, 2, "falsex Line 1"), cueCategory: "DIALOGUE",
                        corrupted: true
                    }] as CueDto[];
                testingStore.dispatch(updateCues(cues) as {} as AnyAction);
                const testingResponse = {
                    matches: [
                        {
                            message: "there are spelling errors",
                            replacements: [{ "value": "false" }],
                            offset: 0,
                            length: 6,
                            context: { text: "falsex is not a word", length: 6, offset: 0 },
                            rule: { id: ruleId }
                        }
                    ]
                };
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);

                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementationOnce(() =>
                        new Promise((resolve) => resolve({ json: () => testingResponse, ok: true })));

                const hash = generateSpellcheckHash(ignoredKeyword, ruleId);
                const ignoredKeyWordMap = {};
                ignoredKeyWordMap[trackId] = {
                    hashes: [hash],
                    creationDate: new Date()
                };
                localStorage.setItem(Constants.SPELLCHECKER_IGNORES_LOCAL_STORAGE_KEY,
                    JSON.stringify(ignoredKeyWordMap));

                //WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 2, "Dummy Cue"),
                    testingStore.getState().cues[0].editUuid) as {} as AnyAction);

                // THEN
                setTimeout(
                    () => {
                        // @ts-ignore modern browsers does have it
                        expect(global.fetch).toBeCalledWith(
                            "https://testing-domain/v2/check",
                            {
                                method: "POST",
                                body: "language=en-US&text=Dummy Cue" +
                                    "&disabledRules=UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END"
                            }
                        );
                        expect(testingStore.getState().cues[0].spellCheck).toEqual({ "matches": []});
                        expect(testingStore.getState().cues[0].corrupted).toBeFalsy();
                        done();
                    },
                    50
                );
            });

            it("disable calls to spellchecker when if language tool responds with 400 error", async () => {
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[2].editUuid;

                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementation(() => new Promise((resolve) =>
                        resolve({ status: 400, ok: false })));

                //WHEN
                for (let i = 0; i < 10; i++) {
                    await testingStore.dispatch(
                        await updateVttCue(2, new VTTCue(2, 2.5, "Dummyx Cue"),
                            editUuid) as {} as AnyAction);
                }

                //THEN
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledTimes(2);
            });

            it("rethrows any error if it is not 400 code",  async() => {
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
                testingStore.dispatch(updateEditingTrack(
                    { language: { id: "en-US" }, id: trackId } as Track
                ) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[2].editUuid;
                // @ts-ignore modern browsers does have it
                global.fetch = jest.fn()
                    .mockImplementationOnce(() => Promise.reject({ status: 401, ok: false }));
                jest.spyOn(Promise, "reject");

                //WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(2, 2.5, "Dummyx Cue"),
                    editUuid) as {} as AnyAction);

                //THEN
                expect(Promise.reject).toBeCalledTimes(1);
                expect(Promise.reject).toBeCalledWith({ status: 401, ok: false });
            });
        });

        describe("range prevention", () => {
            it("apply invalid end time prevention on start time change", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(2, 2, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1.999);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationError).toEqual(true);
            });

            it("apply invalid end time prevention on end time change", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(2, 0, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2.001);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationError).toEqual(true);
            });

            it("Adjust startTime to follow min caption gap passed from subtitle spec", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 1200,
                    maxCaptionDurationInMillis: 4000,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 30,
                    enabled: true
                } as SubtitleSpecification;

                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(3, 4, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2.8);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationError).toEqual(true);
            });

            it("doesn't apply min range limitation for start/end time if time values weren't changed", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 3000,
                    maxCaptionDurationInMillis: 4000,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 30,
                    enabled: true
                } as SubtitleSpecification;

                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 2, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationError).toEqual(false);
            });

            it("Adjust endtime to follow min caption gap passed from subtitle spec", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 1200,
                    maxCaptionDurationInMillis: 4000,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 30,
                    enabled: true
                } as SubtitleSpecification;

                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(2, 3, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(3.2);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationError).toEqual(true);
            });

            it("Adjust startTime to follow max caption gap passed from subtitle spec", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 500,
                    maxCaptionDurationInMillis: 1000,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 30,
                    enabled: true
                } as SubtitleSpecification;

                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(2.8, 4, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(3);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationError).toEqual(true);
            });

            it("doesn't apply max range limitation for start/end time if time values weren't changed", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 1200,
                    maxCaptionDurationInMillis: 1500,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 30,
                    enabled: true
                } as SubtitleSpecification;

                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 2, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().cues[0].corrupted).toEqual(true);
                expect(testingStore.getState().validationError).toEqual(false);
            });


            it("Adjust endtime to follow max caption gap passed from subtitle spec", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 500,
                    maxCaptionDurationInMillis: 1000,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 30,
                    enabled: true
                } as SubtitleSpecification;

                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(2, 5, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(3);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationError).toEqual(true);
            });

            it("Adjust startTime to follow min caption gap with default gap limits values", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(3.6, 4, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(3.6);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationError).toEqual(false);
            });


            it("Adjust endtime to follow min caption gap with default gap limits values", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(2, 2.4, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2.4);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationError).toEqual(false);
            });

            it("Adjust startTime to follow max caption gap with default gap limits values", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[2].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(2, new VTTCue(5, 18, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(6);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(18);
                expect(testingStore.getState().cues[2].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationError).toEqual(true);
            });


            it("Adjust endtime to follow max caption gap with default gap limits values", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[2].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(2, new VTTCue(12, 999999, "Dummy Cue"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(12);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(999999);
                expect(testingStore.getState().cues[2].vttCue.text).toEqual("Dummy Cue");
            });

            it("applies the change if current cue doesn't conform to character limitation rules", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 10,
                    enabled: true
                } as SubtitleSpecification;

                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(0, new VTTCue(0, 2, "Change to be applied"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Change to be applied");
            });
        });

        describe("overlap prevention", () => {
            it("apply overlap prevention for end time", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 3, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationError).toEqual(true);
            });

            it("doesn't apply overlap prevention for end time if wasn't changed", () => {
                // GIVEN
                const cuesOverlapped = [
                    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[];
                testingStore.dispatch(updateCues(cuesOverlapped) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(2, 4, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().cues[1].corrupted).toEqual(false);
                expect(testingStore.getState().cues[0].corrupted).toEqual(false);
                expect(testingStore.getState().validationError).toEqual(false);
            });

            it("doesn't apply overlap prevention for end time if overlapping is enabled", () => {
                // GIVEN
                const cuesOverlapped = [
                    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(1, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[];
                testingStore.dispatch(updateCues(cuesOverlapped) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                const track = { ...testingTrack, overlapEnabled: true };
                testingStore.dispatch(updateEditingTrack(track) as {} as AnyAction);
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 3, "Caption Line 1"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3);
                expect(testingStore.getState().cues[0].corrupted).toEqual(false);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].corrupted).toEqual(false);
                expect(testingStore.getState().validationError).toEqual(false);
            });

            it("apply overlap prevention for start time", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(0, 4, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().validationError).toEqual(true);
            });

            it("doesn't apply overlap prevention for start time if overlapping is enabled", () => {
                // GIVEN
                const cuesOverlapped = [
                    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(1, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[];
                testingStore.dispatch(updateCues(cuesOverlapped) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                const track = { ...testingTrack, overlapEnabled: true };
                testingStore.dispatch(updateEditingTrack(track) as {} as AnyAction);
                testingStore.dispatch(updateVttCue(1, new VTTCue(1, 4, "Caption Line 2"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
                expect(testingStore.getState().cues[1].corrupted).toEqual(false);
                expect(testingStore.getState().cues[0].corrupted).toEqual(false);
                expect(testingStore.getState().validationError).toEqual(false);
            });

            it("doesn't apply overlap prevention for start time if not changed", () => {
                // GIVEN
                const cuesOverlapped = [
                    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[];
                testingStore.dispatch(updateCues(cuesOverlapped) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 2, "Dummy Cue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy Cue");
                expect(testingStore.getState().cues[0].corrupted).toEqual(false);
                expect(testingStore.getState().cues[1].corrupted).toEqual(false);
                expect(testingStore.getState().validationError).toEqual(false);
            });

            it("doesn't apply overlap prevention if overlapping is enabled and there are no subtitle specs", () => {
                // GIVEN
                const testingSubtitleSpecification = { enabled: false } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const cuesOverlapped = [
                    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(1, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[];
                testingStore.dispatch(updateCues(cuesOverlapped) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                const track = { ...testingTrack, overlapEnabled: true };
                testingStore.dispatch(updateEditingTrack(track) as {} as AnyAction);
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 3, "Caption Line 1"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().cues[1].corrupted).toEqual(false);
                expect(testingStore.getState().cues[0].corrupted).toEqual(false);
                expect(testingStore.getState().validationError).toEqual(false);
            });

            it("doesn't apply overlap prevention if overlapping is enabled and there are subtitle specs", () => {
                // GIVEN
                const testingSubtitleSpecification = {
                    enabled: true,
                    minCaptionDurationInMillis: 1000,
                    maxCaptionDurationInMillis: 2000
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const cuesOverlapped = [
                    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(1, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
                ] as CueDto[];
                testingStore.dispatch(updateCues(cuesOverlapped) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                const track = { ...testingTrack, overlapEnabled: true };
                testingStore.dispatch(updateEditingTrack(track) as {} as AnyAction);
                testingStore.dispatch(
                    updateVttCue(1, new VTTCue(1.5, 2.4, "Caption Line 2"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1.4);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2.4);
                expect(testingStore.getState().cues[1].corrupted).toEqual(true);
                expect(testingStore.getState().cues[0].corrupted).toEqual(true);
                expect(testingStore.getState().validationError).toEqual(true);
            });
        });

        describe("character/line count limitation", () => {
            it("apply line count prevention according to subtitle specs", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: true,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 30,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(1, new VTTCue(0, 2, "Dummy \n\nCue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
                expect(testingStore.getState().validationError).toEqual(true);
            });

            it("ignore line count prevention if null in subtitle specs", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: true,
                    maxLinesPerCaption: null,
                    maxCharactersPerLine: 30,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 2, "Dummy \n\nCue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy \n\nCue");
                expect(testingStore.getState().validationError).toEqual(false);
            });

            it("ignore line count prevention if subtitle specs are disabled", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: false,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 30,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(updateVttCue(0, new VTTCue(0, 2, "Dummy \n\nCue"), editUuid) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Dummy \n\nCue");
                expect(testingStore.getState().validationError).toEqual(false);
            });

            it("doesn't apply character count limitation to first line", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: true,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 15,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(1, new VTTCue(0, 2, "Long long line 1\nline 2"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Long long line 1\nline 2");
                expect(testingStore.getState().validationError).toEqual(true);
            });

            it("doesn't apply character count limitation to second line", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: true,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 15,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[1].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(1, new VTTCue(0, 2, "line 1\nlong long line 2"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("line 1\nlong long line 2");
                expect(testingStore.getState().validationError).toEqual(true);
            });

            it("do not count HTML tags into line count limitation", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: true,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 10,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(0, new VTTCue(0, 2, "line 1\n<i>l<b>ine</b></i> 2"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("line 1\n<i>l<b>ine</b></i> 2");
                expect(testingStore.getState().validationError).toEqual(false);
            });

            it("ignore character line count limitation if null in subtitle specs", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: true,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: null,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(0, new VTTCue(0, 2, "line 1\nlong line 2"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("line 1\nlong line 2");
                expect(testingStore.getState().validationError).toEqual(false);
            });

            it("ignore character line count limitation if subtitle specs are disabled", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: false,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 10,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(0, new VTTCue(0, 2, "line 1\nlong line 2"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("line 1\nlong line 2");
                expect(testingStore.getState().validationError).toEqual(false);
            });

            it("does not apply character limitation if previous cue doesn't conform to rules as well", () => {
                // GIVEN
                const cuesLong = [
                    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                ] as CueDto[];
                testingStore.dispatch(updateCues(cuesLong) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    enabled: true,
                    maxLinesPerCaption: 2,
                    maxCharactersPerLine: 10,
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(0, new VTTCue(0, 2, "line 1\nlong line 2"), editUuid) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("line 1\nlong line 2");
                expect(testingStore.getState().cues[0].corrupted).toEqual(true);
                expect(testingStore.getState().validationError).toEqual(false);
            });
        });

        describe("text only update", () => {
            it("ignores time code changes if text only change", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(0, new VTTCue(1, 3, "Caption Line X"), editUuid, true) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line X");
            });

            it("doesn't set validation error if change is text only and time codes are different", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
                const editUuid = testingStore.getState().cues[0].editUuid;

                // WHEN
                testingStore.dispatch(
                    updateVttCue(0, new VTTCue(1, 3, "Caption Line X"), editUuid, true) as {} as AnyAction);

                // THEN
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line X");
                expect(testingStore.getState().validationError).toEqual(false);
            });
        });
    });

    describe("updateCueCategory", () => {
        it("ignores category update if cue doesn't exist in top level cues", () => {
            // WHEN
            testingStore.dispatch(updateCueCategory(3, "ONSCREEN_TEXT") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[3]).toBeUndefined();
        });

        it("updates top level cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateCueCategory(1, "AUDIO_DESCRIPTION") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].cueCategory).toEqual("AUDIO_DESCRIPTION");
        });

        it("preserves all other existing cue parameters", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateCueCategory(2, "ONSCREEN_TEXT") as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
            expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(4);
            expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(6);
            expect(testingStore.getState().cues[2].corrupted).toBeTruthy();
            expect(testingStore.getState().cues[2].cueCategory).toEqual("ONSCREEN_TEXT");
            expect(testingStore.getState().cues[2].spellCheck)
                .toEqual({ matches: [{ message: "some-spell-check-problem" }]});
        });

    });

    describe("addCue", () => {
        it("adds first cue to the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues([]) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(
                addCue(0) as {} as AnyAction
            );

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3);
            expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
            expect(testingStore.getState().cues[0].editUuid).not.toBeEmpty;
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().validationError).toEqual(false);
        });

        it("record cues change when cue is added", () => {
            // GIVEN
            testingStore.dispatch(updateCues([]) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(addCue(0) as {} as AnyAction);

            // THEN
            const lastCueChange = testingStore.getState().lastCueChange;
            expect(lastCueChange.changeType).toEqual("ADD");
            expect(lastCueChange.index).toEqual(0);
            expect(lastCueChange.vttCue.text).toEqual("");
            expect(lastCueChange.vttCue.startTime).toEqual(0);
            expect(lastCueChange.vttCue.endTime).toEqual(3);
        });

        it("adds cue to the end of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(
                addCue(3) as {} as AnyAction
            );

            // THEN
            expect(testingStore.getState().cues[2].vttCue).toEqual(new VTTCue(4, 6, "Caption Line 3"));
            expect(testingStore.getState().cues[3].vttCue.startTime).toEqual(6);
            expect(testingStore.getState().cues[3].vttCue.endTime).toEqual(9);
            expect(testingStore.getState().cues[3].cueCategory).toEqual("ONSCREEN_TEXT");
            expect(testingStore.getState().editingCueIndex).toEqual(3);
            expect(testingStore.getState().validationError).toEqual(false);
        });

        it("add cue in middle of cue array cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues([
                { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4.225, 5, "Caption Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(addCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4.225);
            expect(testingStore.getState().cues[1].cueCategory).toEqual("DIALOGUE");
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().validationError).toEqual(false);
        });

        it("doesn't add cue in middle of cue array cues if there's overlap", () => {
            // GIVEN
            testingStore.dispatch(updateCues([
                { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(addCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
            expect(testingStore.getState().validationError).toEqual(true);
        });

        it("adds cue in middle of cue array cues if there's overlap but overlapping is enabled", () => {
            // GIVEN
            testingStore.dispatch(updateCues([
                { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);

            // WHEN
            testingTrack.overlapEnabled = true;
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            testingStore.dispatch(addCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues.length).toEqual(3);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(5);
            expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(4);
            expect(testingStore.getState().validationError).toEqual(false);
        });

        it("resets editor states map in Redux", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(updateEditorState(0, EditorState.createEmpty()) as {} as AnyAction);
            testingStore.dispatch(updateEditorState(1, EditorState.createEmpty()) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(
                addCue(3) as {} as AnyAction
            );

            // THEN
            expect(testingStore.getState().editorStates.size).toEqual(0);
        });

        it("scrolls to bottom", () => {
            // GIVEN
            testingStore.dispatch(updateCues([]) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(addCue(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        });

        describe("range prevention", () => {
            it("adjusts endTime to be following cue startTime if it exceeds following startTime", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(1) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues.length).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
                expect(testingStore.getState().validationError).toEqual(false);
            });

            it("does not add cue if duration is less than min gap limit", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 3000,
                    maxCaptionDurationInMillis: 5000,
                    enabled: true
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(1) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues.length).toEqual(3);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(4);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(6);
                expect(testingStore.getState().validationError).toEqual(true);
            });

            it("picks default step if it less than max gap limit provided by subtitle specs", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 3000,
                    maxCaptionDurationInMillis: 5000,
                    enabled: true
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(2) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues.length).toEqual(4);
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(6);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(9);
            });

            it("picks subtitle specs max gap as step if it is greater than default step value", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);
                const testingSubtitleSpecification = {
                    minCaptionDurationInMillis: 1000,
                    maxCaptionDurationInMillis: 2000,
                    enabled: true
                } as SubtitleSpecification;
                testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(2) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues.length).toEqual(4);
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(6);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(8);
            });

            it("uses default NEW_ADDED_CUE_DEFAULT_STEP if no subtitle specs provided", () => {
                // GIVEN
                testingStore.dispatch(updateCues(testingCuesWithGaps) as {} as AnyAction);

                // WHEN
                testingStore.dispatch(
                    addCue(2) as {} as AnyAction
                );

                // THEN
                expect(testingStore.getState().cues.length).toEqual(4);
                expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(6);
                expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(9);
            });
        });
    });

    describe("deleteCue", () => {
        it("deletes cue at the beginning of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(2, 4, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().lastCueChange.changeType).toEqual("REMOVE");
            expect(testingStore.getState().lastCueChange.index).toEqual(0);
        });

        it("deletes cue in the middle of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues([
                { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4.225, 5, "Caption Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);
            testingStore.dispatch(addCue(1) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(0, 2, "Caption Line 1"));
            expect(testingStore.getState().cues[1].vttCue).toEqual(new VTTCue(4.225, 5, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().lastCueChange.changeType).toEqual("REMOVE");
            expect(testingStore.getState().lastCueChange.index).toEqual(1);
        });

        it("deletes cue at the end of the cue array", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(2) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(new VTTCue(0, 2, "Caption Line 1"));
            expect(testingStore.getState().cues[1].vttCue).toEqual(new VTTCue(2, 4, "Caption Line 2"));
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
            expect(testingStore.getState().lastCueChange.changeType).toEqual("REMOVE");
            expect(testingStore.getState().lastCueChange.index).toEqual(2);
        });

        it("removes editor states for certain index from Redux", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(updateEditorState(0, EditorState.createEmpty()) as {} as AnyAction);
            testingStore.dispatch(updateEditorState(1, EditorState.createEmpty()) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editorStates.size).toEqual(1);
            expect(testingStore.getState().editorStates.get(1)).toBeUndefined();
        });

        it("delete all cues in the array leaves one default empty cue", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(deleteCue(2) as {} as AnyAction);
            testingStore.dispatch(deleteCue(1) as {} as AnyAction);
            testingStore.dispatch(deleteCue(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
            expect(testingStore.getState().cues.length).toEqual(1);

            expect(testingStore.getState().cues[0].vttCue.text).toEqual("");
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3);
            expect(testingStore.getState().cues[0].vttCue.align).toEqual("center");
            expect(testingStore.getState().cues[0].vttCue.line).toEqual("auto");
            expect(testingStore.getState().cues[0].vttCue.position).toEqual("auto");
            expect(testingStore.getState().cues[0].vttCue.positionAlign).toEqual("auto");
        });
    });

    describe("updateCues", () => {
        it("initializes cues", () => {
            // GIVEN
            const expectedCues = [
                { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", corrupted: false },
                { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT", corrupted: false },
            ] as CueDto[];

            // WHEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(expectedCues[0].vttCue);
            expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
            expect(testingStore.getState().cues[0].corrupted).toEqual(false);
            expect(testingStore.getState().cues[0].editUuid).not.toBeEmpty;
            expect(testingStore.getState().cues[1].vttCue).toEqual(expectedCues[1].vttCue);
            expect(testingStore.getState().cues[1].cueCategory).toEqual("ONSCREEN_TEXT");
            expect(testingStore.getState().cues[1].corrupted).toEqual(false);
            expect(testingStore.getState().cues[1].editUuid).not.toBeEmpty;
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });

        it("replaces existing cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const replacementCues = [
                { vttCue: new VTTCue(2, 3, "Replacement"), cueCategory: "DIALOGUE", corrupted: false },
            ] as CueDto[];

            // WHEN
            testingStore.dispatch(updateCues(replacementCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue).toEqual(replacementCues[0].vttCue);
            expect(testingStore.getState().cues[0].cueCategory).toEqual("DIALOGUE");
            expect(testingStore.getState().cues[0].corrupted).toEqual(false);
            expect(testingStore.getState().cues[0].editUuid).not.toBeEmpty;
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });

        it("resets subtitle edits states", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            testingStore.dispatch(updateEditorState(0, EditorState.createEmpty()) as {} as AnyAction);
            const replacementCues = [
                { vttCue: new VTTCue(2, 3, "Replacement"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            // WHEN
            testingStore.dispatch(updateCues(replacementCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editorStates.size).toEqual(0);
        });

        it("mark cues as corrupted if  they doesn't conform to rules", () => {
            // GIVEN
            const cuesCorrupted = [
                { vttCue: new VTTCue(0, 2, "Caption Long 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 4, "Caption 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4, 6, "Caption Long Overlapped 3"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(5, 8, "Caption 4"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 10,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateCues(cuesCorrupted) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].corrupted).toBeTruthy();
            expect(testingStore.getState().cues[1].corrupted).toBeFalsy();
            expect(testingStore.getState().cues[2].corrupted).toBeTruthy();
            expect(testingStore.getState().cues[3].corrupted).toBeTruthy();
        });

        it("does not mark cues as corrupted if maxCharactersPerLine is null", () => {
            // GIVEN
            const cuesCorrupted = [
                { vttCue: new VTTCue(0, 2, "Caption Long 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 4, "Caption 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4, 6, "Caption Long Overlapped 3"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(6, 8, "Caption 4"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerLine: null,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateCues(cuesCorrupted) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].corrupted).toBeFalsy();
            expect(testingStore.getState().cues[1].corrupted).toBeFalsy();
            expect(testingStore.getState().cues[2].corrupted).toBeFalsy();
            expect(testingStore.getState().cues[3].corrupted).toBeFalsy();
        });

        it("does not mark cues as corrupted if maxCharactersPerLine is 0", () => {
            // GIVEN
            const cuesCorrupted = [
                { vttCue: new VTTCue(0, 2, "Caption Long 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 4, "Caption 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4, 6, "Caption Long Overlapped 3"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(6, 8, "Caption 4"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 0,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(updateCues(cuesCorrupted) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].corrupted).toBeFalsy();
            expect(testingStore.getState().cues[1].corrupted).toBeFalsy();
            expect(testingStore.getState().cues[2].corrupted).toBeFalsy();
            expect(testingStore.getState().cues[3].corrupted).toBeFalsy();
        });
    });

    describe("updateEditingCueIndex", () => {
        it("updates editing cue index", () => {
            // WHEN
            testingStore.dispatch(updateEditingCueIndex(5) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(5);
        });

        it("update scroll position when zero", () => {
            // WHEN
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        });

        it("update scroll position when positive", () => {
            // WHEN
            testingStore.dispatch(updateEditingCueIndex(5) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        });

        it("doesn't update scroll position when less than zero", () => {
            // WHEN
            testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().scrollPosition).toBeUndefined;
        });
    });

    describe("updateSourceCues", () => {
        it("initializes source cues", () => {
            // WHEN
            testingStore.dispatch(updateSourceCues(testingCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().sourceCues).toEqual(testingCues);
        });

        it("replaces existing source cues", () => {
            // GIVEN
            testingStore.dispatch(updateSourceCues(testingCues) as {} as AnyAction);
            const replacementCues = [
                { vttCue: new VTTCue(2, 3, "Replacement"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            // WHEN
            testingStore.dispatch(updateSourceCues(replacementCues) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().sourceCues).toEqual(replacementCues);
        });
    });


    describe("applyShiftTime", () => {
        it("apply shift time", () => {
            //GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(applyShiftTime(2.123) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(2.123);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(4.123);
        });
    });

    it("Resets cues on resetEditingTrack", () => {
        //GIVEN
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

        //WHEN
        testingStore.dispatch(resetEditingTrack() as {} as AnyAction);

        // THEN
        expect(testingStore.getState().cues.length).toEqual(0);
    });

    it("Resets source cues on resetEditingTrack", () => {
        //GIVEN
        testingStore.dispatch(updateSourceCues(testingCues) as {} as AnyAction);

        //WHEN
        testingStore.dispatch(resetEditingTrack() as {} as AnyAction);

        // THEN
        expect(testingStore.getState().sourceCues.length).toEqual(0);
    });

    describe("setValidationError", () => {
        it("sets validation error", () => {
            //GIVEN

            // WHEN
            testingStore.dispatch(setValidationError(true) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().validationError).toEqual(true);
        });
    });

    describe("syncCues", () => {
        it("doesn't sync timecodes if there are no sourceCues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(syncCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
        });

        it("syncs timecodes between sourceCues and cues", () => {
            // GIVEN
            testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
            const sourceTestingCues = [
                { vttCue: new VTTCue(1, 3, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 5, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
                { vttCue: new VTTCue(5, 7, "Caption Line 3"), cueCategory: "ONSCREEN_TEXT" },
            ] as CueDto[];
            testingStore.dispatch(updateSourceCues(sourceTestingCues) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(syncCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(3);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(5);
        });
    });

    describe("validateCorruptedCues", () => {
        it("validate only corrupted cues", () => {
            // GIVEN
            const spellCheck = {
                matches: [
                    {
                        offset: 8, length: 5, replacements: [{ "value": "Line" }] as Replacement[],
                        context: { text: "Caption Linex 1", offset: 8, length: 5 },
                        rule: { id: ruleId }
                    }
                ]
            } as SpellCheck;

            const cues = [
                {
                    vttCue: new VTTCue(0, 2, "Caption Linex 1"),
                    cueCategory: "DIALOGUE", corrupted: true, spellCheck: spellCheck
                },
                {
                    vttCue: new VTTCue(2, 4, "Caption Linex 2"),
                    cueCategory: "DIALOGUE", corrupted: true, spellCheck: spellCheck
                },
                {
                    vttCue: new VTTCue(4, 6, "Caption Line 3"),
                    cueCategory: "DIALOGUE", corrupted: false
                },
                {
                    vttCue: new VTTCue(6, 0, "Caption Line 4"), // bad timing
                    cueCategory: "DIALOGUE", corrupted: false
                }
            ] as CueDto[];

            testingStore = createTestingStore({ cues });

            // WHEN
            testingStore.dispatch(validateCorruptedCues() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].corrupted).toBeTruthy();
            expect(testingStore.getState().cues[1].corrupted).toBeTruthy();
            expect(testingStore.getState().cues[2].corrupted).toBeFalsy();
            expect(testingStore.getState().cues[3].corrupted).toBeFalsy();
        });

    });

});
