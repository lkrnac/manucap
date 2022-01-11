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
            className="btn btn-secondary"
            toggled={!waveformVisible}
            onClick={(): void => {
                dispatch(waveformVisibleSlice.actions.setWaveformVisible(!waveformVisible));
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? <><i className="fas fa-wave-square" /> Show Waveform</>
                    : <><i className="fas fa-wave-square" /> Hide Waveform</>
            )}
        />
    );
};

export default WaveformToggle;
