import React, {
    ReactElement
} from "react";
import {
    padWithZeros,
    removeNonNumeric
} from "../../utils/timeUtils";

const MAX_MINUTES = 999;

const getMinutes = (time: number): string => {
    const minutes = Math.floor(time / 60);
    if (minutes > MAX_MINUTES) {
        return MAX_MINUTES.toString();
    }
    return padWithZeros(minutes, 3);
};

const calculateTime = (time: number, newMinutesValue: string): number => {
    let minutes = Number(newMinutesValue);
    const currentMinutesInSeconds = Math.floor(time / 60) * 60;
    const currentSeconds = Math.floor(time - currentMinutesInSeconds);
    const currentMillis = Math.round((time - currentSeconds - currentMinutesInSeconds) * 1000);
    if (minutes > MAX_MINUTES) {
        minutes = MAX_MINUTES;
    }
    return (Number(minutes) * 60) + currentSeconds + currentMillis;
};

interface Props {
    id: string;
    time: number;
    onChange: (time: number) => {};
}

const TimeEditorMinutes = (props: Props): ReactElement => {
    const handleChange = (value: string): void => {
        props.onChange(calculateTime(props.time, removeNonNumeric(value)));
    };
    return (
        <input
            id={`${props.id}-minutes`}
            type="text"
            className="sbte-time-editor-input"
            value={getMinutes(props.time)}
            onFocus={(e): void => e.target.select()}
            onChange={(e): void => handleChange(e.target.value)}
        />
    );
};

export default TimeEditorMinutes;
