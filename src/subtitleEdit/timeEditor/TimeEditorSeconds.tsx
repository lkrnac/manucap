import React, {
    ReactElement
} from "react";
import {
    getTimeInUnits,
    padWithZeros,
    removeNonNumeric
} from "../../utils/timeUtils";

const MAX_MINUTES = 999;
const MAX_SECONDS = 59;

const getSeconds = (time: number): string => {
    const timeInUnits = getTimeInUnits(time);
    if (timeInUnits.seconds > MAX_SECONDS || time > ((MAX_MINUTES * 60) + MAX_SECONDS)) {
        return MAX_SECONDS.toString();
    }
    return padWithZeros(timeInUnits.seconds, 2);
};

const calculateTime = (time: number, newSecondsValue: string): number => {
    let seconds = Number(newSecondsValue);
    const timeInUnits = getTimeInUnits(time);
    let plusMinutesInSeconds = 0;
    if (seconds > MAX_SECONDS) {
        plusMinutesInSeconds = Math.floor(seconds / 60);
        seconds = seconds - plusMinutesInSeconds;
        if (timeInUnits.minutes + plusMinutesInSeconds > MAX_MINUTES) {
            seconds = MAX_SECONDS;
            plusMinutesInSeconds = 0;
        }
    }
    return timeInUnits.minutesInSeconds + plusMinutesInSeconds + seconds + timeInUnits.millis;
};

interface Props {
    id: string;
    time: number;
    onChange: (time: number) => void;
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
