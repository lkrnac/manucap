import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import ToggleButton from "../../common/ToggleButton";
import { setOverlapCaptions } from "../cues/cueSlices";

export const CaptionOverlapToggle = (): ReactElement => {
    const dispatch = useDispatch();
    const overlapCaptions = useSelector((state: SubtitleEditState) => state.overlapCaptions);
    return (
        <ToggleButton
            className="btn btn-secondary"
            onClick={(): void => {
                dispatch(setOverlapCaptions(!overlapCaptions));
            }}
            render={(toggle): ReactElement => (
                toggle ?
                    <><i className="fas fa-lock" /> Prevent Overlapping Captions</> :
                    <><i className="fas fa-lock-open" /> Allow Overlapping Captions</>
            )}
        />
    );
};

export default CaptionOverlapToggle;
