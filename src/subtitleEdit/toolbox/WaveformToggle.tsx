import { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import ToggleButton from "./ToggleButton";
import { waveformVisibleSlice } from "../player/waveformSlices";

export const WaveformToggle = (): ReactElement => {
    const dispatch = useDispatch();
    const waveformVisible = useSelector((state: SubtitleEditState) => state.waveformVisible);
    return (
        <ToggleButton
            className="tw-dropdown-item tw-flex tw-items-center tw-justify-between"
            toggled={waveformVisible}
            onClick={(): void => {
                dispatch(waveformVisibleSlice.actions.setWaveformVisible(!waveformVisible));
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
