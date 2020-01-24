import React, {
    ChangeEvent,
    ReactElement
} from "react";
import { getTimeFromString, getTimeString } from "../utils/timeUtils";
import TimeField from "react-advanced-timefield";

interface Props {
    time?: number;
    onChange: (time: number) => void;
}

const TimeEditor = (props: Props): ReactElement => {
    const handleChange = (_e: ChangeEvent<HTMLInputElement>, timeString: string): void => {
      const time = getTimeFromString(timeString);
      props.onChange(time);
    };
    return (
        <TimeField
            className="sbte-time-input"
            style={{
                margin: "5px",
                width: "130px",
                maxWidth: "200px",
                padding: "5px"
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
