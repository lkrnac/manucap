import { getTimeGapLimits, markCues } from "./cueVerifications";
import { SubtitleSpecification } from "../toolbox/model";
import { CueDto, CueError } from "../model";

describe("cueVerifications", () => {
    describe("getTimeGapLimits", () => {
        it("Gets default time gaps if subtitleSpecs is null", () => {
            // GIVEN // WHEN
            const timeGap = getTimeGapLimits(null);

            // THEN
            expect(timeGap.minGap).toEqual(0.001);
            expect(timeGap.maxGap).toEqual(Number.MAX_SAFE_INTEGER);
        });

        it("Gets time gap limits from subtitle specs if provided and enabled", () => {
            // GIVEN // WHEN
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: 2000,
                maxCaptionDurationInMillis: 6000,
                enabled: true
            } as SubtitleSpecification;

            const timeGap = getTimeGapLimits(testingSubtitleSpecification);

            // THEN
            expect(timeGap.minGap).toEqual(2);
            expect(timeGap.maxGap).toEqual(6);
        });

        it("Gets time gap limits from subtitle specs if provided but not enabled", () => {
            // GIVEN // WHEN
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: 2000,
                maxCaptionDurationInMillis: 6000,
                enabled: false
            } as SubtitleSpecification;

            const timeGap = getTimeGapLimits(testingSubtitleSpecification);

            // THEN
            expect(timeGap.minGap).toEqual(0.001);
            expect(timeGap.maxGap).toEqual(Number.MAX_SAFE_INTEGER);
        });

        it("Gets default min gap limit if subtitle specs is enabled but min caption is null", () => {
            // GIVEN // WHEN
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: null,
                maxCaptionDurationInMillis: 7500,
                enabled: true
            } as SubtitleSpecification;

            const timeGap = getTimeGapLimits(testingSubtitleSpecification);

            // THEN
            expect(timeGap.minGap).toEqual(0.001);
            expect(timeGap.maxGap).toEqual(7.5);
        });

        it("Gets default max gap limit if subtitle specs is enabled but max caption is null", () => {
            // GIVEN // WHEN
            const testingSubtitleSpecification = {
                minCaptionDurationInMillis: 1500,
                maxCaptionDurationInMillis: null,
                enabled: true
            } as SubtitleSpecification;

            const timeGap = getTimeGapLimits(testingSubtitleSpecification);

            // THEN
            expect(timeGap.minGap).toEqual(1.5);
            expect(timeGap.maxGap).toEqual(Number.MAX_SAFE_INTEGER);
        });
    });

    describe("markCues", () => {
        it("returns errors if cue has errors", () => {
            // GIVEN
            const cues = [
                { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE",
                    errors: [CueError.LINE_CHAR_LIMIT_EXCEEDED]},
                { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            // WHEN
            const markedCues = markCues(cues, null, false);

            // THEN
            expect(markedCues[0].errors).toEqual([CueError.LINE_CHAR_LIMIT_EXCEEDED]);
            expect(markedCues[1].errors).toBeUndefined();
        });

        it("marks cue with line count error if cue has too many lines", () => {
            // GIVEN
            const cues = [
                { vttCue: new VTTCue(0, 1, "Caption\nLine\n1"), cueCategory: "DIALOGUE",
                    errors: []},
            ] as CueDto[];
            const testingSubtitleSpecification = {
                enabled: true,
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 30,
            } as SubtitleSpecification;
            // WHEN
            const markedCues = markCues(cues, testingSubtitleSpecification, false);

            // THEN
            expect(markedCues[0].errors).toEqual([CueError.LINE_COUNT_EXCEEDED]);
        });
    });
});
