import { MouseEvent, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ManuCapState } from "../manuCapReducers";
import ToggleButton from "./ToggleButton";
import { waveformVisibleSlice } from "../player/waveformSlices";
import Icon from "@mdi/react";
import { mdiWaveform } from "@mdi/js";

interface Props {
    onClick: (event: MouseEvent<HTMLElement>) => void
}

export const WaveformToggle = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const waveformVisible = useSelector((state: ManuCapState) => state.waveformVisible);
    return (
        <ToggleButton
            className="flex items-center justify-between"
            toggled={waveformVisible}
            onClick={(event): void => {
                dispatch(waveformVisibleSlice.actions.setWaveformVisible(!waveformVisible));
                props.onClick(event);
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? (
                        <>
                            <span className="flex items-center">
                                <Icon path={mdiWaveform} size={1.25} />
                                <span className="pl-4">Waveform</span>
                            </span>
                            <span className="mc-badge font-medium mc-badge-sm mc-badge-success">SHOWN</span>
                        </>
                    )
                    : (
                        <>
                            <span className="flex items-center">
                                <Icon path={mdiWaveform} size={1.25} />
                                <span className="pl-4">Waveform</span>
                            </span>
                            <span className="mc-badge font-medium mc-badge-sm mc-badge-secondary">HIDDEN</span>
                        </>
                    )
            )}
        />
    );
};

export default WaveformToggle;
