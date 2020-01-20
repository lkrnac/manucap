import React, {
    ChangeEvent,
    ReactElement
} from "react";
import { getTimeFromString, getTimeString } from "../utils/timeUtils";
import TimeField from "react-advanced-timefield";

interface Props {
    id: string;
    time?: number;
    onChange: (time: number) => {};
}

const TimeEditor = (props: Props): ReactElement => {
    const handleChange = (_e: ChangeEvent<HTMLInputElement>, timeString: string): void => {
      const time = getTimeFromString(timeString);
      props.onChange(time);
    };
    return (
        <div id={props.id} style={{ display: "flex" }} className="sbte-time-editor">
            <TimeField
                className="sbte-time-input"
                value={getTimeString(props.time || 0)}
                onChange={handleChange}
                showSeconds
                showMillis
            />
        </div>
    );
};

TimeEditor.defaultProps = {
    time: 0
} as Partial<Props>;

export default TimeEditor;
