import React, {
    ChangeEvent,
    ReactElement
} from "react";

const MAX_MINUTES = 999;
const MAX_SECONDS = 60;
const MAX_MILLISECONDS = 1000;
const MINUTES = "minutes";
const SECONDS = "seconds";
const MILLISECONDS = "milliseconds";

const removeNonNumeric = (value: string): string => {
    return value.replace(/\D/g,"");
};

const adjustValue = (stringValue: string, type: string): string => {
    let value = Number(stringValue);
    switch (type) {
        case MINUTES:
            if (value > MAX_MINUTES) {
                value = MAX_MINUTES;
            }
            break;
        case SECONDS:
            if (value > MAX_SECONDS) {
                const minutes = Math.floor(value / 60);
                const seconds = value - minutes * 60;
                value = seconds;
                // addMinutes(minutes);
            }
            break;
        case MILLISECONDS:
            if (value > MAX_MILLISECONDS) {
                const seconds = Math.floor(value / 1000);
                const milliseconds = value - seconds * 1000;
                value = milliseconds;
                if (seconds > MAX_SECONDS) {
                    // const minutes = Math.floor(value / 60);
                    // const seconds = value - minutes * 60;
                    // addSeconds(seconds);
                    // addMinutes(minutes);
                }
            }
            break;
    }
    return value.toString();
};

const padWithZeros = (value: string, type: string): string => {
    let maxLength = 3;
    if (type === SECONDS) {
        maxLength = 2;
    }
    return value.padStart(maxLength, "0");
};

const handleChange = (e: ChangeEvent<HTMLInputElement>, type: string): void => {
    let value = e.target.value;
    value = removeNonNumeric(value);
    value = adjustValue(value, type);
    value = padWithZeros(value, type);
    e.target.value = value;
};

const TimeEditor = (): ReactElement => {
    return (
        <div style={{display: "flex"}} className="sbte-time-editor">
            <div style={{flexFlow: "column"}}>
                <input type="text" className="sbte-time-editor-input"
                       onBlur={(e): void => handleChange(e, MINUTES)}
                />
            </div>
            <div style={{flexFlow: "column"}}>
                <div style={{verticalAlign: "bottom", padding: "5px"}}><span>:</span></div>
            </div>
            <div style={{flexFlow: "column"}}>
                <input type="text" className="sbte-time-editor-input" style={{width: "30px"}}
                       onBlur={(e): void => handleChange(e, SECONDS)}
                />
            </div>
            <div>
                <div style={{verticalAlign: "bottom", padding: "5px"}}><span>.</span></div>
            </div>
            <div style={{flexFlow: "column"}}>
                <input type="text" className="sbte-time-editor-input"
                       onBlur={(e): void => handleChange(e, MILLISECONDS)}
                />
            </div>
        </div>
    );
};

export default TimeEditor;
