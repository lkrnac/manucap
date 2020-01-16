export const copyNonConstructorProperties = (newCue: VTTCue, oldCue: VTTCue): void => {
    newCue.position = oldCue.position;
    newCue.align = oldCue.align;

    // TODO: Enable following property copying if it will be correctly implemented by browsers in future.
    // Currently I found that most reliable approach is not to touch it, otherwise weird failures may arise.
    // The problem is here: https://github.com/mozilla/vtt.js/blob/master/lib/vttcue.js#L248
    // Browser (this was the case for FF and Chrome at the time) believes that correct values for positionAlign are
    // https://github.com/mozilla/vtt.js/blob/master/lib/vttcue.js#L25 (values for align property).
    // But correct values are: https://github.com/Microsoft/TypeScript/blob/master/lib/lib.dom.d.ts#L20165
    // It seems that this parameter is not yet correctly implemented by browsers.
    // newCue.positionAlign = oldCue.positionAlign;
    newCue.region = oldCue.region;
    newCue.snapToLines = oldCue.snapToLines;
    newCue.size = oldCue.size;
    newCue.lineAlign = oldCue.lineAlign;
    newCue.line = oldCue.line;
    newCue.vertical = oldCue.vertical;
    newCue.id = oldCue.id;
    newCue.pauseOnExit = oldCue.pauseOnExit;
};
