import "video.js"; // import VTTCue type
import {
    Position,
    PositionStyle,
    copyNonConstructorProperties,
    findPositionIcon,
    positionIcons,
    positionStyles,
} from "./cueUtils";
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
            oldCue.positionAlign = "line-left";
            oldCue.lineAlign = "end";

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
            expect(newCue.positionAlign).toEqual("line-left");
            expect(newCue.lineAlign).toEqual("end");
        });
    });

    describe("positionStyles", () => {
        it("are immutable", () => {
            // WHEN
            positionStyles.set(
                Position.Row1Column1,
                { line: 16, align: "center", positionAlign: "auto", position: 51 }
            );

            // THEN
            expect(positionStyles.get(Position.Row1Column1))
                .toEqual({ line: 0, align: "start", positionAlign: "center", position: 51 });
        });

        // noinspection DuplicatedCode
        each([
            [Position.Row1Column1, { line: 0, align: "start", positionAlign: "center", position: 51 }],
            [Position.Row1Column2, { line: 0, align: "start", positionAlign: "center", position: 65 }],
            [Position.Row1Column3, { line: 0, align: "center", positionAlign: "auto", position: "auto"  }],
            [Position.Row1Column4, { line: 0, align: "end", positionAlign: "center", position: 35 }],
            [Position.Row1Column5, { line: 0, align: "end", positionAlign: "center", position: 49 }],
            [Position.Row2Column1, { line: 4, align: "start", positionAlign: "center", position: 51 }],
            [Position.Row2Column2, { line: 4, align: "start", positionAlign: "center", position: 65 }],
            [Position.Row2Column3, { line: 4, align: "center", positionAlign: "auto", position: "auto" }],
            [Position.Row2Column4, { line: 4, align: "end", positionAlign: "center", position: 35 }],
            [Position.Row2Column5, { line: 4, align: "end", positionAlign: "center", position: 49 }],
            [Position.Row3Column1, { line: 8, align: "start", positionAlign: "center", position: 51 }],
            [Position.Row3Column2, { line: 8, align: "start", positionAlign: "center", position: 65 }],
            [Position.Row3Column3, { line: 8, align: "center", positionAlign: "auto", position: "auto" }],
            [Position.Row3Column4, { line: 8, align: "end", positionAlign: "center", position: 35 }],
            [Position.Row3Column5, { line: 8, align: "end", positionAlign: "center", position: 49 }],
            [Position.Row4Column1, { line: 12, align: "start", positionAlign: "center", position: 51 }],
            [Position.Row4Column2, { line: 12, align: "start", positionAlign: "center", position: 65 }],
            [Position.Row4Column3, { line: 12, align: "center", positionAlign: "auto", position: "auto" }],
            [Position.Row4Column4, { line: 12, align: "end", positionAlign: "center", position: 35 }],
            [Position.Row4Column5, { line: 12, align: "end", positionAlign: "center", position: 49 }],
            [Position.Row5Column1, { line: 15, align: "start", positionAlign: "center", position: 51 }],
            [Position.Row5Column2, { line: 15, align: "start", positionAlign: "center", position: 65 }],
            [Position.Row5Column3, { line: "auto", align: "center", positionAlign: "auto", position: "auto" }],
            [Position.Row5Column4, { line: 15, align: "end", positionAlign: "center", position: 35 }],
            [Position.Row5Column5, { line: 15, align: "end", positionAlign: "center", position: 49 }],
        ])
        .it("are correctly initialized", (testingPosition: Position, expectedPositionStyle: PositionStyle) => {
            // WHEN
            const actualPositionStyle = positionStyles.get(testingPosition);

            // THEN
            expect(actualPositionStyle).toEqual(expectedPositionStyle);
        });
    });

    describe("positionIcons", () => {
        // noinspection DuplicatedCode
        each([
            [0, Position.Row1Column1, "↖↖", "6px" ],
            [1, Position.Row1Column2, "↖↑", "9px" ],
            [2, Position.Row1Column3, "↑↑", "13px" ],
            [3, Position.Row1Column4, "↑↗", "11px" ],
            [4, Position.Row1Column5, "↗↗", "6px" ],
            [5, Position.Row2Column1, "↖←", "6px" ],
            [6, Position.Row2Column2, "↖", "13px" ],
            [7, Position.Row2Column3, "↑", "16px" ],
            [8, Position.Row2Column4, "↗", "13px" ],
            [9, Position.Row2Column5, "→↗", "6px" ],
            [10, Position.Row3Column1, "←←", "5px" ],
            [11, Position.Row3Column2, "←", "12px" ],
            [12, Position.Row3Column3, "•", "16px" ],
            [13, Position.Row3Column4, "→", "12px" ],
            [14, Position.Row3Column5, "→→", "5px" ],
            [15, Position.Row4Column1, "↙←", "6px" ],
            [16, Position.Row4Column2, "↙", "13px" ],
            [17, Position.Row4Column3, "↓", "16px" ],
            [18, Position.Row4Column4, "↘", "13px" ],
            [19, Position.Row4Column5, "→↘", "6px" ],
            [20, Position.Row5Column1, "↙↙", "6px" ],
            [21, Position.Row5Column2, "↙↓", "9px" ],
            [22, Position.Row5Column3, "↓↓", "13px" ],
            [23, Position.Row5Column4, "↓↘", "11px" ],
            [24, Position.Row5Column5, "↘↘", "6px" ],
        ])
        .it("are correctly initialized", (
            index: number,
            expectedPosition: Position,
            expectedIconText: string,
            expectedLeftPadding: string
        ) => {
            // WHEN
            const actualPositionIcon = positionIcons[index];

            // THEN
            expect(actualPositionIcon.position).toEqual(expectedPosition);
            expect(actualPositionIcon.iconText).toEqual(expectedIconText);
            expect(actualPositionIcon.leftPadding).toEqual(expectedLeftPadding);
        });
    });

    describe("findPositionIcon", () => {
        it("finds icon for Row2Column2 position", () => {
            // GIVEN
            const cue = new VTTCue(0, 1, "some text");
            cue.line = 4;
            cue.align = "start";
            cue.positionAlign = "center";
            cue.position = 65;

            // WHEN
            const actualPositionIcon = findPositionIcon(cue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↖");
        });

        it("finds icon for Row4Column3 position", () => {
            // GIVEN
            const cue = new VTTCue(0, 1, "some text");
            cue.line = 12;
            cue.align = "center";
            cue.positionAlign = "auto";
            cue.position = "auto";

            // WHEN
            const actualPositionIcon = findPositionIcon(cue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↓");
        });

        it("finds icon for default position", () => {
            // GIVEN
            const cue = new VTTCue(0, 1, "some text");
            cue.line = "auto";
            cue.align = "center";
            cue.positionAlign = "auto";
            cue.position = "auto";

            // WHEN
            const actualPositionIcon = findPositionIcon(cue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↓↓");
        });

        it("treats position as default if line parameter is not from positionStyles list", () => {
            // GIVEN
            const cue = new VTTCue(0, 1, "some text");
            cue.line = 16;
            cue.align = "start";
            cue.positionAlign = "center";
            cue.position = 65;

            // WHEN
            const actualPositionIcon = findPositionIcon(cue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↓↓");
        });

        it("treats position as default if align parameter is not from positionStyles list", () => {
            // GIVEN
            const cue = new VTTCue(0, 1, "some text");
            cue.line = 4;
            cue.align = "left";
            cue.positionAlign = "center";
            cue.position = 65;

            // WHEN
            const actualPositionIcon = findPositionIcon(cue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↓↓");
        });

        it("treats position as default if positionAlign parameter is not from positionStyles list", () => {
            // GIVEN
            const cue = new VTTCue(0, 1, "some text");
            cue.line = 4;
            cue.align = "start";
            cue.positionAlign = "line-left";
            cue.position = 65;

            // WHEN
            const actualPositionIcon = findPositionIcon(cue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↓↓");
        });

        it("treats position as default if position parameter is not from positionStyles list", () => {
            // GIVEN
            const cue = new VTTCue(0, 1, "some text");
            cue.line = 4;
            cue.align = "start";
            cue.positionAlign = "center";
            cue.position = 22;

            // WHEN
            const actualPositionIcon = findPositionIcon(cue);

            // THEN
            expect(actualPositionIcon.iconText).toEqual("↓↓");
        });
    });
});
