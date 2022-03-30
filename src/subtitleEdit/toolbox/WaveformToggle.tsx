import { MouseEvent, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import ToggleButton from "./ToggleButton";
import { waveformVisibleSlice } from "../player/waveformSlices";

interface Props {
    onClick: (event: MouseEvent<HTMLElement>) => void
}

export const WaveformToggle = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const waveformVisible = useSelector((state: SubtitleEditState) => state.waveformVisible);
    return (
        <ToggleButton
            className="tw-flex tw-items-center tw-justify-between"
            toggled={waveformVisible}
            onClick={(event): void => {
                dispatch(waveformVisibleSlice.actions.setWaveformVisible(!waveformVisible));
                props.onClick(event);
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? (
                        <>
                            Waveform{" "}
                            <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-success">SHOWN</span>
                        </>
                    )
                    : (
                        <>
                            Waveform{" "}
                            <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-secondary">HIDDEN</span>
                        </>
                    )
            )}
        />
    );
};

export default WaveformToggle;
