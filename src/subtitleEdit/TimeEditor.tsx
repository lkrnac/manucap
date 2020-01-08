import React, {
    ChangeEvent,
    ReactElement, useState
} from "react";

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

interface Props {
    id: string;
    minutes?: string;
    seconds?: string;
    milliseconds?: string;
}

const TimeEditor = (props: Props): ReactElement => {
    const [minutes, setMinutes] = useState(props.minutes);
    const [seconds, setSeconds] = useState(props.seconds);
    const [milliseconds, setMilliseconds] = useState(props.milliseconds);

    const adjustValue = (stringValue: string, type: string): string => {
        let value = Number(stringValue);
        switch (type) {
            case MINUTES:
                if (value > MAX_MINUTES) {
                    value = MAX_MINUTES;
                }
                setMinutes(padWithZeros(value, MINUTES));
                break;
            case SECONDS:
                if (value > MAX_SECONDS) {
                    const plusMinutes = Math.floor(value / 60);
                    value = value - plusMinutes * 60;
                    const currentMinutes = Number(minutes) + plusMinutes;
                    adjustValue(currentMinutes.toString(), MINUTES);
                }
                setSeconds(padWithZeros(value, SECONDS));
                break;
            case MILLISECONDS:
                if (value > MAX_MILLISECONDS) {
                    const plusSeconds = Math.floor(value / 1000);
                    value = value - plusSeconds * 1000;
                    const currentSeconds = Number(seconds) + plusSeconds;
                    adjustValue(currentSeconds.toString(), SECONDS);
                }
                setMilliseconds(padWithZeros(value, MILLISECONDS));
                break;
        }
        return value.toString();
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>, type: string): void => {
        let value = e.target.value;
        value = removeNonNumeric(value);
        adjustValue(value, type);
    };

    return (
        <div id={props.id} style={{display: "flex"}} className="sbte-time-editor">
            <div style={{flexFlow: "column"}}>
                <input id={`${props.id}-minutes`} type="text" className="sbte-time-editor-input"
                       value={minutes}
                       onChange={(e): void => setMinutes(e.target.value)}
                       onFocus={(e): void => e.target.select()}
                       onBlur={(e): void => handleChange(e, MINUTES)}
                />
            </div>
            <div style={{flexFlow: "column"}}>
                <div style={{verticalAlign: "bottom", padding: "5px"}}><span>:</span></div>
            </div>
            <div style={{flexFlow: "column"}}>
                <input id={`${props.id}-seconds`} type="text" className="sbte-time-editor-input" style={{width: "30px"}}
                       value={seconds}
                       onChange={(e): void => setSeconds(e.target.value)}
                       onFocus={(e): void => e.target.select()}
                       onBlur={(e): void => handleChange(e, SECONDS)}
                />
            </div>
            <div>
                <div style={{verticalAlign: "bottom", padding: "5px"}}><span>.</span></div>
            </div>
            <div style={{flexFlow: "column"}}>
                <input id={`${props.id}-milliseconds`} type="text" className="sbte-time-editor-input"
                       value={milliseconds}
                       onChange={(e): void => setMilliseconds(e.target.value)}
                       onFocus={(e): void => e.target.select()}
                       onBlur={(e): void => handleChange(e, MILLISECONDS)}
                />
            </div>
        </div>
    );
};

TimeEditor.defaultProps = {
    minutes: "000",
    seconds: "00",
    milliseconds: "000",
} as Partial<Props>;

export default TimeEditor;
