import { Dispatch } from "react";
import { AnyAction } from "@reduxjs/toolkit";

import { createTestingStore } from "../../../testUtils/testingStore";
import { CueDto } from "../../model";
import { updateCues } from "../cueSlices";
import { fetchSpellCheckDebounced } from "./spellCheckFetch";
import { AppThunk } from "../../subtitleEditReducers";

const testingStore = createTestingStore();

describe("fetchSpellCheck", () => {
    it("updates cues in redux with spell checking state", (done) => {
        // GIVEN
        const testingResponse = {
            matches: [
                {
                    message: "This sentence does not start with an uppercase letter",
                    replacements: [{ "value": "Txt" }],
                    "offset": 0,
                    "length": 3,
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
                }
            ]
        };

        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "AUDIO_DESCRIPTION" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        // @ts-ignore modern browsers does have it
        global.fetch = jest.fn()
            .mockImplementationOnce(() => new Promise((resolve) => resolve({ json: () => testingResponse })));

        // WHEN
        fetchSpellCheckDebounced(
            testingStore.dispatch as Dispatch<AppThunk>,
            1,
            "txt to chck",
            "en-US",
            "dev-spell-checker.videotms.com"
        );

        // THEN
        setTimeout(
            () => {
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledWith(
                    "https://dev-spell-checker.videotms.com/v2/check",
                    { method: "POST", body: "language=en-US&text=txt to chck" }
                );
                expect(testingStore.getState().cues[1].spellCheck).toEqual(testingResponse);
                expect(testingStore.getState().cues[1].editUuid).not.toBeUndefined();
                expect(testingStore.getState().cues[1].corrupted).toBeFalsy();
                expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
                expect(testingStore.getState().cues[1].cueCategory).toEqual("AUDIO_DESCRIPTION");
                done();
            }
            , 250
        );
    });

    it("does not trigger spell check if domain is undefined", (done) => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "AUDIO_DESCRIPTION" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        // @ts-ignore modern browsers does have it
        global.fetch = jest.fn()
            .mockImplementationOnce(() => new Promise((resolve) => resolve({ json: () => ({}) })));

        // WHEN
        fetchSpellCheckDebounced(
            testingStore.dispatch as Dispatch<AppThunk>,
            1,
            "txt to chck",
            "en-US",
            undefined
        );

        // THEN
        setTimeout(
            () => {
                // @ts-ignore modern browsers does have it
                expect(global.fetch).not.toBeCalled();
                expect(testingStore.getState().cues[1].spellCheck).toBeUndefined();
                done();
            },
            250
        );
    });

    it("does not trigger spell check if domain is undefined", (done) => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "AUDIO_DESCRIPTION" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        // @ts-ignore modern browsers does have it
        global.fetch = jest.fn()
            .mockImplementationOnce(() => new Promise((resolve) => resolve({ json: () => ({}) })));

        // WHEN
        fetchSpellCheckDebounced(
            testingStore.dispatch as Dispatch<AppThunk>,
            1,
            "txt to chck",
            undefined,
            "dev-spell-checker.videotms.com"
        );

        // THEN
        setTimeout(
            () => {
                // @ts-ignore modern browsers does have it
                expect(global.fetch).not.toBeCalled();
                expect(testingStore.getState().cues[1].spellCheck).toBeUndefined();
                done();
            },
            250
        );
    });
});