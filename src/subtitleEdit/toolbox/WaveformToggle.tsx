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
            className="btn"
            toggled={waveformVisible}
            onClick={(): void => {
                dispatch(waveformVisibleSlice.actions.setWaveformVisible(!waveformVisible));
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? <>Waveform <span className="sbte-toggled-badge sbte-toggled-badge-off">HIDE</span></>
                    : <>Waveform <span className="sbte-toggled-badge sbte-toggled-badge-on">SHOW</span></>
            )}
        />
    );
};

export default WaveformToggle;
