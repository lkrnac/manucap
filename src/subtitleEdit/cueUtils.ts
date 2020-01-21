import Immutable from "immutable";

export const copyNonConstructorProperties = (newCue: VTTCue, oldCue: VTTCue): void => {
    newCue.position = oldCue.position;
    newCue.align = oldCue.align;

    // TODO: Remove conditional if browsers start to initialize VtTTCue.positionAlign/lineAlign correctly
    // It looks like these properties are not initialized correctly in VTTCue constructor (for certain browsers).
    // Therefore we need to initialize them when we are copying it,
    // otherwise the assignment will fail and some positions are misplaced
    // NOTE: It is not possible to test case where oldCue.positionAlign/lineAlign is undefined,
    // because VTTCue constructor from video.js work correctly,
    // thus it is not possible to simulate failure case in node, it happens in browsers.
    newCue.lineAlign = oldCue.lineAlign ? oldCue.lineAlign : "center";
    newCue.positionAlign = oldCue.positionAlign ? oldCue.positionAlign : "auto";

    newCue.region = oldCue.region;
    newCue.snapToLines = oldCue.snapToLines;
    newCue.size = oldCue.size;
    newCue.line = oldCue.line;
    newCue.vertical = oldCue.vertical;
    newCue.id = oldCue.id;
    newCue.pauseOnExit = oldCue.pauseOnExit;
};

export interface PositionStyle {
    line: number;
    align: string;
}

export enum Position {
    TopLeft,
    TopCenter,
    TopRight,
    CenterLeft,
    Center,
    CenterRight,
    BottomLeft,
    BottomCenter,
    BottomRight
}

// noinspection DuplicatedCode code is in test as well
const positionStylesArray = [
    [Position.TopLeft,        { line: 0, align: "start" }],
    [Position.TopCenter,      { line: 0, align: "center" }],
    [Position.TopRight,       { line: 0, align: "end" }],
    [Position.CenterLeft,     { line: 7, align: "start" }],
    [Position.Center,         { line: 7, align: "center" }],
    [Position.CenterRight,    { line: 7, align: "end" }],
    [Position.BottomLeft,     { line: 16, align: "start" }],
    [Position.BottomCenter,   { line: 16, align: "center" }],
    [Position.BottomRight,    { line: 16, align: "end" }],
];
export const positionStyles = Immutable.Map<Position, PositionStyle>(positionStylesArray);

// noinspection DuplicatedCode code is in test as well
const positionIconsArray = [
    [Position.TopLeft,        "↖"],
    [Position.TopCenter,      "↑"],
    [Position.TopRight,       "↗"],
    [Position.CenterLeft,     "←"],
    [Position.Center,         "•"],
    [Position.CenterRight,    "→"],
    [Position.BottomLeft,     "↙"],
    [Position.BottomCenter,   "↓"],
    [Position.BottomRight,    "↘"],
];
export const positionIcons = Immutable.Map<Position, string>(positionIconsArray);