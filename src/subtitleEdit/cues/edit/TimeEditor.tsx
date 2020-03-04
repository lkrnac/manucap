import React, {
    ChangeEvent,
    ReactElement
} from "react";
import { getTimeFromString, getTimeString } from "../timeUtils";
import TimeField from "react-advanced-timefield";

interface Props {
    referenceTime?: number;
    time?: number;
    onChange: (time: number) => void;
}

const TimeEditor = (props: Props): ReactElement => {
    const validTime = !props.referenceTime || (props.referenceTime < (props.time || 0));
    const editorClassName = validTime ? "sbte-time-input" : "sbte-time-input-error";
    const handleChange = (_e: ChangeEvent<HTMLInputElement>, timeString: string): void => {
      const time = getTimeFromString(timeString);
      props.onChange(time);
    };
    return (
        <TimeField
            className={editorClassName}
            style={{
                marginBottom: "5px",
                width: "120px",
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
