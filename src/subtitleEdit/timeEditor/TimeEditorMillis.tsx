import React, {
    ReactElement
} from "react";
import {
    padWithZeros,
    removeNonNumeric
} from "../../utils/timeUtils";

const MAX_MINUTES = 999;
const MAX_SECONDS = 59;
const MAX_MILLIS = 999;

const getMillis = (time: number): string => {
    const minutesInSeconds = Math.floor(time / 60) * 60;
    const seconds = Math.floor(time - minutesInSeconds);
    const millis = Math.round((time - seconds - minutesInSeconds) * 1000);
    if (millis > MAX_MILLIS || time > ((MAX_MINUTES * 60) + MAX_SECONDS + MAX_MILLIS)) {
        return MAX_MILLIS.toString();
    }
    return padWithZeros(millis, 3);
};

const calculateTime = (time: number, newMillisValue: string): number => {
    let millis = Number(newMillisValue);
    const currentMinutesInSeconds = Math.floor(time / 60) * 60;
    const currentSeconds = Math.floor(time - currentMinutesInSeconds);
    let plusSeconds = 0;
    if (millis > MAX_MILLIS) {
        plusSeconds = Math.floor(millis / 1000);
        millis = millis - (plusSeconds * 1000);
        if (currentSeconds + plusSeconds > MAX_SECONDS) {
            millis = MAX_MILLIS;
            plusSeconds = 0;
        }
    }
    return currentMinutesInSeconds + currentSeconds + plusSeconds + (millis / 1000);
};

interface Props {
    id: string;
    time: number;
    onChange: (time: number) => {};
}

const TimeEditorMillis = (props: Props): ReactElement => {
    const handleChange = (value: string): void => {
        props.onChange(calculateTime(props.time, removeNonNumeric(value)));
    };
    return (
        <input
            id={`${props.id}-millis`}
            type="text"
            className="sbte-time-editor-input"
            value={getMillis(props.time)}
            onFocus={(e): void => e.target.select()}
            onChange={(e): void => handleChange(e.target.value)}
        />
    );
};

export default TimeEditorMillis;
