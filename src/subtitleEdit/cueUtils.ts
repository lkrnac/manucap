import Immutable from "immutable";

export const copyNonConstructorProperties = (newCue: VTTCue, oldCue: VTTCue): void => {
    newCue.position = oldCue.position;
    // TODO: Change following try-catch to simple assignment when browsers fix align "center" value
    // Currently browsers (FF and Chrome) use "middle" instead of "center"
    try {
        newCue.align = oldCue.align;
    } catch(e) {
        // it is not possible to test this, because current version of video.js uses `center` value
        // and doesn't allow this assignment. This code is only for browsers that doesn't support `center` so far
        newCue.align = "middle" as AlignSetting;
    }

    // TODO: Enable following properties copying if they will be correctly implemented by browsers in future.
    // Currently I found that most reliable approach is not to touch it, otherwise weird failures may arise.
    // The problem is here: https://github.com/mozilla/vtt.js/blob/master/lib/vttcue.js#L248
    // Browser (this was the case for FF and Chrome at the time) believes that correct values for
    // positionAlign/lineAlign are
    // https://github.com/mozilla/vtt.js/blob/master/lib/vttcue.js#L25 (values for align property).
    // But correct values are: https://github.com/Microsoft/TypeScript/blob/master/lib/lib.dom.d.ts#L20165
    // It seems that this parameter is not yet correctly implemented by browsers.
    // newCue.positionAlign = oldCue.positionAlign;
    // newCue.lineAlign = oldCue.lineAlign;
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

