import React, {
    ChangeEvent,
    ReactElement
} from "react";
import { getTimeFromString, getTimeString } from "../../../utils/timeUtils";
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
