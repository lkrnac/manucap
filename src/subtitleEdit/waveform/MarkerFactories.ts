// @ts-ignore
import CustomPointMarker from "./CustomPointMarker";
// @ts-ignore
import SimplePointMarker from "./SimplePointMarker";
// @ts-ignore
import CustomSegmentMarker from "./CustomSegmentMarker";

export const createPointMarker = (options: any) => {
    if (options.view === "zoomview") {
        return new CustomPointMarker(options);
    }
    else {
        return new SimplePointMarker(options);
    }
};

export const createSegmentMarker = (options: any) => {
    if (options.view === "zoomview") {
        return new CustomSegmentMarker(options);
    }

    return null;
};
