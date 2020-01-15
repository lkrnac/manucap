export const copyNonConstructorProperties = (newCue: VTTCue, oldCue: VTTCue): void => {
    newCue.position = oldCue.position;
    newCue.align = oldCue.align;
    newCue.positionAlign = oldCue.positionAlign;
    newCue.region = oldCue.region;
    newCue.snapToLines = oldCue.snapToLines;
    newCue.size = oldCue.size;
    newCue.lineAlign = oldCue.lineAlign;
    newCue.line = oldCue.line;
    newCue.vertical = oldCue.vertical;
    newCue.id = oldCue.id;
    newCue.pauseOnExit = oldCue.pauseOnExit;
};
