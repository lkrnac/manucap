import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import ToggleButton from "./ToggleButton";
import { timecodesLockSlice } from "../trackSlices";

export const TimecodesLockToggle = (): ReactElement => {
    const dispatch = useDispatch();
    const timecodesUnlocked = useSelector((state: SubtitleEditState) => state.timecodesUnlocked);
    return (
        <ToggleButton
            className="btn btn-secondary"
            toggled={timecodesUnlocked}
            onClick={(): void => {
                dispatch(timecodesLockSlice.actions.unlockTimecodes(!timecodesUnlocked));
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? <><i className="far fa-clock" /> Lock Timecodes</>
                    : <><i className="fas fa-clock" /> Unlock Timecodes</>
            )}
        />
    );
};

export default TimecodesLockToggle;
