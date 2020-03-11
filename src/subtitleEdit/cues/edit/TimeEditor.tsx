import React, {
    ReactElement,
    SyntheticEvent
} from "react";
import { getTimeFromString, getTimeString } from "../timeUtils";
import TimeField from "react-advanced-timefield";

interface Props {
    time?: number;
    onChange: (time: number) => void;
}

const styles = {
    marginBottom: "5px",
    width: "110px",
    maxWidth: "200px",
    padding: "5px",
    textAlign: "center"
};

const TimeEditor = (props: Props): ReactElement => {
    const handleChange = (_e: SyntheticEvent<HTMLInputElement>, timeString: string): void => {
        const time = getTimeFromString(timeString);
        props.onChange(time);
    };
    return (
        <TimeField
            className="sbte-time-input mousetrap"
            style={styles}
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
