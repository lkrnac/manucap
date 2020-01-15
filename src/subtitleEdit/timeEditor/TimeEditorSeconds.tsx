import React, {
    ReactElement
} from "react";
import {
    padWithZeros,
    removeNonNumeric
} from "../../utils/timeUtils";

const MAX_MINUTES = 999;
const MAX_SECONDS = 59;

const getSeconds = (time: number): string => {
    const minutesInSeconds = Math.floor(time / 60) * 60;
    const seconds = Math.floor(time - minutesInSeconds);
    if (seconds > MAX_SECONDS || time > ((MAX_MINUTES * 60) + MAX_SECONDS)) {
        return MAX_SECONDS.toString();
    }
    return padWithZeros(seconds, 2);
};

const calculateTime = (time: number, newSecondsValue: string): number => {
    let seconds = Number(newSecondsValue);
    const currentMinutesInSeconds = Math.floor(time / 60) * 60;
    const currentSeconds = Math.floor(time - currentMinutesInSeconds);
    const currentMillis = Math.round((time - currentSeconds - currentMinutesInSeconds) * 1000);
    let plusMinutesInSeconds = 0;
    if (seconds > MAX_SECONDS) {
        plusMinutesInSeconds = Math.floor(seconds / 60);
        seconds = seconds - plusMinutesInSeconds;
        if (Math.floor(currentMinutesInSeconds / 60) + plusMinutesInSeconds > MAX_MINUTES) {
            seconds = MAX_SECONDS;
            plusMinutesInSeconds = 0;
        }
    }
    return currentMinutesInSeconds + plusMinutesInSeconds + seconds + currentMillis;
};

interface Props {
    id: string;
    time: number;
    onChange: (time: number) => {};
}

const TimeEditorSeconds = (props: Props): ReactElement => {
    const handleChange = (value: string): void => {
        props.onChange(calculateTime(props.time, removeNonNumeric(value)));
    };
    return (
        <input
            id={`${props.id}-seconds`}
            type="text"
            className="sbte-time-editor-input"
            style={{ width: "30px" }}
            value={getSeconds(props.time)}
            onFocus={(e): void => e.target.select()}
            onChange={(e): void => handleChange(e.target.value)}
        />
    );
};

export default TimeEditorSeconds;
