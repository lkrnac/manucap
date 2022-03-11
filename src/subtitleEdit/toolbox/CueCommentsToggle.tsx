import { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import ToggleButton from "./ToggleButton";
import { commentsVisibleSlice } from "../cues/comments/commentsSlices";

export const CueCommentsToggle = (): ReactElement => {
    const dispatch = useDispatch();
    const commentsVisible = useSelector((state: SubtitleEditState) => state.commentsVisible);
    return (
        <ToggleButton
            className="tw-dropdown-item tw-flex tw-items-center tw-justify-between"
            toggled={commentsVisible}
            onClick={(): void => {
                dispatch(commentsVisibleSlice.actions.setCommentsVisible(!commentsVisible));
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? (
                        <>
                            Comments{" "}
                            <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-success">SHOWN</span>
                        </>
                    )
                    : (
                        <>
                            Comments{" "}
                            <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-secondary">HIDDEN</span>
                        </>
                    )
            )}
        />
    );
};

export default CueCommentsToggle;
