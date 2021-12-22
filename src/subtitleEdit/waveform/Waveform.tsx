import { ReactElement, useEffect, useRef } from "react";
// @ts-ignore no types
import WaveSurfer from "wavesurfer.js";

interface Props {
    mp4: string;
    waveform: string;
}

const Waveform = (props: Props): ReactElement => {
    const waveformRef = useRef(null);

    const getPeaks = (): void =>{
        fetch(props.waveform,
            { headers : { "Content-Type": "application/json", "Accept": "application/json" }})
            .then((response) => response.json())
            .then((peaksData) => {
                if (waveformRef.current) {
                    // @ts-ignore no types available
                    // waveformRef.current?.on("ready", function() {
                    //     // https://wavesurfer-js.org/docs/methods.html
                    //     // @ts-ignore no types available
                    //     waveformRef.current?.setVolume(0.5);
                    //     // @ts-ignore no types available
                    //     waveformRef.current?.play();
                    // });

                    waveformRef.current = WaveSurfer.create({
                        container: waveformRef.current,
                        responsive: true,
                        normalize: true,
                        // barWidth: 1,
                        // partialRender: true
                        // plugins: [
                        //     waveformMinimapRef.current = MinimapPlugin.create({
                        //         container: waveformMinimapRef,
                        //         height: 50,
                        //     })
                        // ]
                    });

                    // @ts-ignore no types available
                    waveformRef.current?.load(
                        props.mp4,
                        peaksData.data
                    );
                }
            });
    };

    useEffect(() => {
        getPeaks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // need to run only once on mount

    return (
        <div ref={waveformRef}  />
    );
};

export default Waveform;
