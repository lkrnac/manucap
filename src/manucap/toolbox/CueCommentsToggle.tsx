import { MouseEvent, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ManuCapState } from "../manuCapReducers";
import ToggleButton from "./ToggleButton";
import { commentsVisibleSlice } from "../cues/comments/commentsSlices";
import Icon from "@mdi/react";
import { mdiCommentTextOutline } from "@mdi/js";

interface Props {
    onClick: (event: MouseEvent<HTMLElement>) => void
}

export const CueCommentsToggle = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const commentsVisible = useSelector((state: ManuCapState) => state.commentsVisible);
    return (
        <ToggleButton
            className="flex items-center justify-between"
            toggled={commentsVisible}
            onClick={(event): void => {
                dispatch(commentsVisibleSlice.actions.setCommentsVisible(!commentsVisible));
                props.onClick(event);
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? (
                        <>
                            <span className="flex items-center">
                                <Icon path={mdiCommentTextOutline} size={1.25} />
                                <span className="pl-4">Comments</span>
                            </span>
                            <span className="mc-badge font-medium mc-badge-sm mc-badge-success">SHOWN</span>
                        </>
                    )
                    : (
                        <>
                            <span className="flex items-center">
                                <Icon path={mdiCommentTextOutline} size={1.25} />
                                <span className="pl-4">Comments</span>
                            </span>
                            <span className="mc-badge font-medium mc-badge-sm mc-badge-secondary">HIDDEN</span>
                        </>
                    )
            )}
        />
    );
};

export default CueCommentsToggle;
