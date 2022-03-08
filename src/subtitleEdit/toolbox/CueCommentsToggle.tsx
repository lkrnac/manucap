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
            className="btn"
            toggled={commentsVisible}
            onClick={(): void => {
                dispatch(commentsVisibleSlice.actions.setCommentsVisible(!commentsVisible));
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? <>Comments <span className="sbte-toggled-badge sbte-toggled-badge-off">HIDE</span></>
                    : <>Comments <span className="sbte-toggled-badge sbte-toggled-badge-on">SHOW</span></>
            )}
        />
    );
};

export default CueCommentsToggle;
