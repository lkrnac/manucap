import { getTimeGapLimits } from "./cueVerifications";
import { CaptionSpecification } from "../toolbox/model";

describe("cueVerifications", () => {
    describe("getTimeGapLimits", () => {
        it("Gets default time gaps if captionSpecs is null", () => {
            // GIVEN // WHEN
            const timeGap = getTimeGapLimits(null);

            // THEN
            expect(timeGap.minGap).toEqual(0.001);
            expect(timeGap.maxGap).toEqual(Number.MAX_SAFE_INTEGER);
        });

        it("Gets time gap limits from caption specs if provided and enabled", () => {
            // GIVEN // WHEN
            const testingCaptionSpecification = {
                minCaptionDurationInMillis: 2000,
                maxCaptionDurationInMillis: 6000,
                enabled: true
            } as CaptionSpecification;

            const timeGap = getTimeGapLimits(testingCaptionSpecification);

            // THEN
            expect(timeGap.minGap).toEqual(2);
            expect(timeGap.maxGap).toEqual(6);
        });

        it("Gets time gap limits from caption specs if provided but not enabled", () => {
            // GIVEN // WHEN
            const testingCaptionSpecification = {
                minCaptionDurationInMillis: 2000,
                maxCaptionDurationInMillis: 6000,
                enabled: false
            } as CaptionSpecification;

            const timeGap = getTimeGapLimits(testingCaptionSpecification);

            // THEN
            expect(timeGap.minGap).toEqual(0.001);
            expect(timeGap.maxGap).toEqual(Number.MAX_SAFE_INTEGER);
        });

        it("Gets default min gap limit if caption specs is enabled but min caption is null", () => {
            // GIVEN // WHEN
            const testingCaptionSpecification = {
                minCaptionDurationInMillis: null,
                maxCaptionDurationInMillis: 7500,
                enabled: true
            } as CaptionSpecification;

            const timeGap = getTimeGapLimits(testingCaptionSpecification);

            // THEN
            expect(timeGap.minGap).toEqual(0.001);
            expect(timeGap.maxGap).toEqual(7.5);
        });

        it("Gets default min gap limit if caption specs is disabled and min caption provided", () => {
            // GIVEN // WHEN
            const testingCaptionSpecification = {
                minCaptionDurationInMillis: 200,
                maxCaptionDurationInMillis: 7500,
                enabled: false
            } as CaptionSpecification;

            const timeGap = getTimeGapLimits(testingCaptionSpecification);

            // THEN
            expect(timeGap.minGap).toEqual(0.001);
            expect(timeGap.maxGap).toEqual(Number.MAX_SAFE_INTEGER);
        });

        it("Gets default max gap limit if caption specs is enabled but max caption is null", () => {
            // GIVEN // WHEN
            const testingCaptionSpecification = {
                minCaptionDurationInMillis: 1500,
                maxCaptionDurationInMillis: null,
                enabled: true
            } as CaptionSpecification;

            const timeGap = getTimeGapLimits(testingCaptionSpecification);

            // THEN
            expect(timeGap.minGap).toEqual(1.5);
            expect(timeGap.maxGap).toEqual(Number.MAX_SAFE_INTEGER);
        });
    });
});
