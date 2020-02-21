import React, {ChangeEvent, ReactElement} from "react";
// import TimeField from "react-advanced-timefield";
// import { getTimeFromString } from "./../../cues/edit/timeUtils";


interface Props {
    time?: number;
    onChange: (time: number) => void;
}

const ShiftTimesForm = (props: Props): ReactElement => {
    const handleChange = (_e: ChangeEvent<HTMLInputElement>): void => {
        const time = parseFloat(_e.target.value);
        _e.target.value=time.toFixed(3);
        props.onChange(time);
    };
    return (
        <form>
            <div className="form-group">
                <label>Time Shift in Seconds.Milliseconds</label>
                <input
                    name="shift"
                    className="form-control dotsub-track-line-shift margin-right-10"
                    style={{ width: "120px" }}
                    onChange={handleChange}
                    type="number"
                    placeholder='0.000'
                    step={"0.100"}
                />
            </div>
        </form>
    );
};

export default ShiftTimesForm;
