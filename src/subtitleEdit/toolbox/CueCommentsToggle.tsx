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
            className="btn btn-secondary"
            toggled={commentsVisible}
            onClick={(): void => {
                dispatch(commentsVisibleSlice.actions.setCommentsVisible(!commentsVisible));
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? <><i className="fas fa-comment-slash" /> Hide Comments</>
                    : <><i className="fas fa-comments" /> Show Comments</>
            )}
        />
    );
};

export default CueCommentsToggle;
