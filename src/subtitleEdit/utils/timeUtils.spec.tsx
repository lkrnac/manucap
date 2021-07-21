import "video.js"; // import VTTCue type
import { getTimeString } from "./timeUtils";

const timeInSeconds = 3750.599; // 1h 2m 30sec 599millis

describe("timeUtils", () => {
    describe("getTimeString", () => {
        it("Gets time formatted as string", () => {
            // GIVEN // WHEN
            const formattedTime = getTimeString(timeInSeconds);

            // THEN
            expect(formattedTime).toEqual("01:02:30.599");
        });
     });

    describe("getTimeString", () => {
        it("Gets time formatted as string hide hours", () => {
            // GIVEN // WHEN
            const formattedTime = getTimeString(timeInSeconds, () => true);

            // THEN
            expect(formattedTime).toEqual("02:30.599");
        });
    });

    describe("getTimeString", () => {
        it("Gets time formatted as string hide hours and millis", () => {
            // GIVEN // WHEN
            const formattedTime = getTimeString(timeInSeconds, ()=> true);

            // THEN
            expect(formattedTime).toEqual("02:30.599");
        });
    });

    describe("getTimeString", () => {
        it("Gets time formatted as string show full format if hide methods return false", () => {
            // GIVEN // WHEN
            const formattedTime = getTimeString(timeInSeconds, ()=> false);

            // THEN
            expect(formattedTime).toEqual("01:02:30.599");
        });
    });


});
