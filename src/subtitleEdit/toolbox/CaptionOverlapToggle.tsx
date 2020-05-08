import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import ToggleButton from "../../common/ToggleButton";
import { setOverlapCaptions } from "../cues/cueSlices";

export const CaptionOverlapToggle = (): ReactElement => {
    const dispatch = useDispatch();
    const overlapCaptions = useSelector((state: SubtitleEditState) => state.overlapCaptions);
    useEffect(
        () => {
            return (): void => { // return means it will be executed during unmount
                dispatch(setOverlapCaptions(false));
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once -> unmount
    );
    return (
        <ToggleButton
            className="btn btn-secondary"
            onClick={(): void => {
                dispatch(setOverlapCaptions(!overlapCaptions));
            }}
            render={(toggle): ReactElement => (
                toggle ?
                    <><i className="fas fa-lock" /> Disable Overlapping</> :
                    <><i className="fas fa-lock-open" /> Enable Overlapping</>
            )}
        />
    );
};

export default CaptionOverlapToggle;
