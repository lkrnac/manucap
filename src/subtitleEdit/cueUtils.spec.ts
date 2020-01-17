import "video.js"; // import VTTCue type
import { Position, PositionStyle, copyNonConstructorProperties, positionStyles } from "./cueUtils";
import each from "jest-each";

describe("cueUtils", () => {
    describe("copyNonConstructorProperties", () => {
        it("copies non-constructor properties from old cue to new one", () => {
            // GIVEN
            const newCue = new VTTCue(0, 1, "new text");
            const oldCue = new VTTCue(1, 2, "old text");
            const region = new VTTRegion();
            region.lines = 10;
            oldCue.position = 10;
            oldCue.align = "center";
            oldCue.region = region;
            oldCue.snapToLines = true;
            oldCue.size = 100;
            oldCue.line = 5;
            oldCue.vertical = "lr";
            oldCue.id = "someId";
            oldCue.pauseOnExit = true;

            // properties not copied - see TODO comment in cueUtil.ts
            oldCue.lineAlign = "end";
            oldCue.positionAlign = "end" as PositionAlignSetting;

            // WHEN
            copyNonConstructorProperties(newCue, oldCue);

            // THEN
            expect(newCue.text).toEqual("new text");
            expect(newCue.startTime).toEqual(0);
            expect(newCue.endTime).toEqual(1);

            expect(newCue.position).toEqual(10);
            expect(newCue.align).toEqual("center");
            // @ts-ignore If it would be null -> test fails
            expect(newCue.region.lines).toEqual(10);
            expect(newCue.snapToLines).toEqual(true);
            expect(newCue.size).toEqual(100);
            expect(newCue.line).toEqual(5);
            expect(newCue.vertical).toEqual("lr");
            expect(newCue.id).toEqual("someId");
            expect(newCue.pauseOnExit).toEqual(true);

            // properties not copied - see TODO comment in cueUtil.ts
            expect(newCue.positionAlign).toEqual("auto");
            expect(newCue.lineAlign).toEqual("start");
        });
    });

    describe("positionStyles", () => {
        it("are immutable", () => {
            // WHEN
            positionStyles.set(Position.TopLeft, { align: "center", line: 16 });

            // THEN
            expect(positionStyles.get(Position.TopLeft)).toEqual({ align: "start", line: 0 });
        });

        // noinspection DuplicatedCode
        each([
            [Position.TopLeft,        { line: 0, align: "start" }],
            [Position.TopCenter,      { line: 0, align: "center" }],
            [Position.TopRight,       { line: 0, align: "end" }],
            [Position.CenterLeft,     { line: 7, align: "start" }],
            [Position.Center,         { line: 7, align: "center" }],
            [Position.CenterRight,    { line: 7, align: "end" }],
            [Position.BottomLeft,     { line: 16, align: "start" }],
            [Position.BottomCenter,   { line: 16, align: "center" }],
            [Position.BottomRight,    { line: 16, align: "end" }],
        ])
        .it("are correctly initialized", (testingPosition: Position, expectedPositionStyle: PositionStyle) => {
            // WHEN
            const actualPositionStyle = positionStyles.get(testingPosition);

            // THEN
            expect(actualPositionStyle).toEqual(expectedPositionStyle);
        });
    });
});
