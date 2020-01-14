import React, {
    ReactElement
} from "react";

/***
 A start time
 The time, in seconds and fractions of a second, that describes the beginning of the range of the media data to which
 the cue applies.

 An end time
 The time, in seconds and fractions of a second, that describes the end of the range of the media data to which the
 cue applies.
 **/

const MAX_MINUTES = 999;
const MAX_SECONDS = 59;
const MAX_MILLISECONDS = 999;
const MINUTES = "minutes";
const SECONDS = "seconds";
const MILLISECONDS = "milliseconds";

const removeNonNumeric = (value: string): string => {
    return value.replace(/\D/g, "");
};

const padWithZeros = (value: number, type: string): string => {
    let maxLength = 3;
    if (type === SECONDS) {
        maxLength = 2;
    }
    return value.toString().padStart(maxLength, "0");
};

const getMinutes = (time: number): string => {
    const minutes = Math.floor(time / 60);
    if (minutes > MAX_MINUTES) {
        return MAX_MINUTES.toString();
    }
    return padWithZeros(minutes, MINUTES);
};

const getSeconds = (time: number): string => {
    const minutesInSeconds = Math.floor(time / 60) * 60;
    const seconds = Math.floor(time - minutesInSeconds);
    if (seconds > MAX_SECONDS || time > ((MAX_MINUTES * 60) + MAX_SECONDS)) {
        return MAX_SECONDS.toString();
    }
    return padWithZeros(seconds, SECONDS);
};

const getMilliseconds = (time: number): string => {
    const minutesInSeconds = Math.floor(time / 60) * 60;
    const seconds = Math.floor(time - minutesInSeconds);
    const milliseconds = Math.round((time - seconds - minutesInSeconds) * 1000);
    if (milliseconds > MAX_MILLISECONDS || time > ((MAX_MINUTES * 60) + MAX_SECONDS + MAX_MILLISECONDS)) {
        return MAX_MILLISECONDS.toString();
    }
    return padWithZeros(milliseconds, MILLISECONDS);
};

interface Props {
    id: string;
    time?: number;
    onChange: (time: number) => {};
}

const TimeEditor = (props: Props): ReactElement => {

    const calculateTime = (stringValue: string, type: string): number => {
        let value = Number(stringValue);
        let time = props.time || 0;
        const currentMinutesInSeconds = Math.floor(time / 60) * 60;
        const currentSeconds = Math.floor(time - currentMinutesInSeconds);
        const currentMilliseconds = Math.round((time - currentSeconds - currentMinutesInSeconds) * 1000);
        switch (type) {
            case MINUTES:
                if (value > MAX_MINUTES) {
                    value = MAX_MINUTES;
                }
                time = (Number(value) * 60) + currentSeconds + currentMilliseconds;
                break;
            case SECONDS:
                let plusMinutesInSeconds = 0;
                if (value > MAX_SECONDS) {
                    plusMinutesInSeconds = Math.floor(value / 60);
                    value = value - plusMinutesInSeconds;
                    if (Math.floor(currentMinutesInSeconds / 60) + plusMinutesInSeconds > MAX_MINUTES) {
                        value = MAX_SECONDS;
                        plusMinutesInSeconds = 0;
                    }
                }
                time = currentMinutesInSeconds + plusMinutesInSeconds + value + currentMilliseconds;
                break;
            case MILLISECONDS:
                let plusSeconds = 0;
                if (value > MAX_MILLISECONDS) {
                    plusSeconds = Math.floor(value / 1000);
                    value = value - (plusSeconds * 1000);
                    if (currentSeconds + plusSeconds > MAX_SECONDS) {
                        value = MAX_MILLISECONDS;
                        plusSeconds = 0;
                    }
                }
                time = currentMinutesInSeconds + currentSeconds + plusSeconds + (value / 1000);
                break;
        }
        return time;
    };

    const handleChange = (value: string, type: string): void => {
        props.onChange(calculateTime(removeNonNumeric(value), type));
    };

    return (
        <div id={props.id} style={{ display: "flex" }} className="sbte-time-editor">
            <div style={{ flexFlow: "column" }}>
                <input
                    id={`${props.id}-minutes`}
                    type="text"
                    className="sbte-time-editor-input"
                    value={getMinutes(props.time || 0)}
                    onFocus={(e): void => e.target.select()}
                    onChange={(e): void => handleChange(e.target.value, MINUTES)}
                />
            </div>
            <label style={{ verticalAlign: "bottom", padding: "5px" }}>:</label>
            <div style={{ flexFlow: "column" }}>
                <input
                    id={`${props.id}-seconds`}
                    type="text"
                    className="sbte-time-editor-input"
                    style={{ width: "30px" }}
                    value={getSeconds(props.time || 0)}
                    onFocus={(e): void => e.target.select()}
                    onChange={(e): void => handleChange(e.target.value, SECONDS)}
                />
            </div>
            <label style={{ verticalAlign: "bottom", padding: "5px" }}>.</label>
            <div style={{ flexFlow: "column" }}>
                <input
                    id={`${props.id}-milliseconds`}
                    type="text"
                    className="sbte-time-editor-input"
                    value={getMilliseconds(props.time || 0)}
                    onFocus={(e): void => e.target.select()}
                    onChange={(e): void => handleChange(e.target.value, MILLISECONDS)}
                />
            </div>
        </div>
    );
};

TimeEditor.defaultProps = {
    time: 0
} as Partial<Props>;

export default TimeEditor;
