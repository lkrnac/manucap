import React, { ReactElement, useEffect, useRef } from "react";
import { Button, ButtonToolbar } from "react-bootstrap";
import Peaks from "peaks.js";

import { createPointMarker, createSegmentMarker } from "./MarkerFactories";
// @ts-ignore
import { createSegmentLabel } from "./SegmentLabelFactory";

// import "./WaveformView.css";

interface Props {
    audioUrl: string;
    audioContentType: string;
    waveformDataUrl?: string;
    audioContext?: any;
    setSegments: (segments: any) => void;
    setPoints: (points: any) => void;
}

const onPeaksReady = (): void => {
    // Do something when the Peaks instance is ready for use
    console.log("Peaks.js is ready");
};

const initPeaks = (
    props: Props,
    zoomviewWaveform: HTMLDivElement,
    overviewWaveform: HTMLDivElement,
    audioElement: HTMLAudioElement,
    peaks: any
): void => {
    const options = {
        containers: {
            overview: overviewWaveform,
            zoomview: zoomviewWaveform
        },
        mediaElement: audioElement,
        keyboard: true,
        logger: console.error.bind(console),
        createSegmentMarker: createSegmentMarker,
        createSegmentLabel: createSegmentLabel,
        createPointMarker: createPointMarker
    };

    if (props.waveformDataUrl) {
        // @ts-ignore
        options.dataUri = {
            arraybuffer: props.waveformDataUrl
        };
    }
    else if (props.audioContext) {
        // @ts-ignore
        options.webAudio = {
            audioContext: props.audioContext
        };
    }

    audioElement.src = props.audioUrl;

    if (peaks) {
        peaks.destroy();
        peaks = null;
    }

    Peaks.init(options, (_err, _peaks) => {
        peaks = _peaks;
        onPeaksReady();
    });
};

const zoomIn = (peaks: any): void => {
    if (peaks) {
        peaks.zoom.zoomIn();
    }
};

const zoomOut = (peaks: any): void => {
    peaks?.zoom.zoomOut();
};

const addSegment = (peaks: any): void => {
    if (peaks) {
        const time = peaks.player.getCurrentTime();

        peaks.segments.add({
            startTime: time,
            endTime: time + 10,
            labelText: "Test Segment",
            editable: true
        });
    }
};

const addPoint = (peaks: any): void => {
    if (peaks) {
        const time = peaks.player.getCurrentTime();

        peaks.points.add({
            time: time,
            labelText: "Test Point",
            editable: true
        });
    }
};

const logMarkers = (props: Props, peaks: any) => {
    if (peaks) {
        props.setSegments(peaks.segments.getSegments());
        props.setPoints(peaks.points.getPoints());
    }
};

const renderButtons = (props: Props, peaks: any): ReactElement => (
    <ButtonToolbar>
        <Button onClick={(): void => zoomIn(peaks)}>Zoom in</Button>&nbsp;
        <Button onClick={(): void => zoomOut(peaks)}>Zoom out</Button>&nbsp;
        <Button onClick={(): void => addSegment(peaks)}>Add Segment</Button>&nbsp;
        <Button onClick={(): void => addPoint(peaks)}>Add Point</Button>&nbsp;
        <Button onClick={(): void => logMarkers(props, peaks)}>Log segments/points</Button>
    </ButtonToolbar>
);

const WaveformView = (props: Props): ReactElement => {
    // const zoomviewWaveformRef = useRef<HTMLDivElement>(null);
    const zoomviewWaveformRef = useRef(null as HTMLDivElement | null);
    const overviewWaveformRef = useRef<HTMLDivElement>(null);
    const audioElementRef = useRef<HTMLAudioElement>(null);
    const peaks = null;

    useEffect(() => {
        if (zoomviewWaveformRef.current && overviewWaveformRef.current && audioElementRef.current) {
            initPeaks(props, zoomviewWaveformRef.current, overviewWaveformRef.current, audioElementRef.current, peaks);
        }
    }, [props]);

    useEffect(
        () => (): void => {
            // @ts-ignore
            peaks?.destroy();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once -> unmount
    );

    return (
        <div>
            <div className="zoomview-container" ref={zoomviewWaveformRef} />
            <div className="overview-container" ref={overviewWaveformRef} />

            <audio ref={audioElementRef} controls>
                <source src={props.audioUrl} type={props.audioContentType} />
                Your browser does not support the audio element.
            </audio>

            {renderButtons(props, peaks)}
        </div>
    );
};

export default WaveformView;
