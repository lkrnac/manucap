import React, {
    ChangeEvent,
    ReactElement
} from "react";
import { getTimeFromString, getTimeString } from "../timeUtils";
import TimeField from "react-advanced-timefield";
import { SubtitleEditState } from "./../../subtitleEditReducers";
import {useSelector} from "react-redux";

interface Props {
    time?: number;
    onChange: (time: number) => void;
}

const TimeEditor = (props: Props): ReactElement => {
    const mediaLengthInSeconds = useSelector((state: SubtitleEditState) => state.editingTrack?.mediaLength || 0) / 1000;
    const handleChange = (e: ChangeEvent<HTMLInputElement>, timeString: string): void => {
      let time = getTimeFromString(timeString);
      time = time >= mediaLengthInSeconds ? mediaLengthInSeconds : time;
      e.target.value = '' + time;
      props.onChange(time);
    };
    return (
        <TimeField
            className="sbte-time-input"
            style={{
                marginBottom: "5px",
                width: "100px",
                maxWidth: "200px",
                padding: "5px",
                textAlign: "center"
            }}
            value={getTimeString(props.time || 0)}
            onChange={handleChange}
            showSeconds
            showMillis
        />
    );
};

TimeEditor.defaultProps = {
    time: 0
} as Partial<Props>;

export default TimeEditor;
