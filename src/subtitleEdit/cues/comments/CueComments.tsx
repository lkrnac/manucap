import React, { ReactElement, useCallback, useState } from "react";
import { CueComment, CueDto } from "../../model";
import { useDispatch, useSelector } from "react-redux";
import { addCueComment, deleteCueComment } from "../cuesList/cuesListActions";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { Character } from "../../utils/shortcutConstants";
import { TooltipWrapper } from "../../TooltipWrapper";

interface Props {
    index: number;
    cue: CueDto;
    commentAuthor?: string;
}

const CueComments = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const [text, setText] = useState("");
    const currentUser = useSelector((state: SubtitleEditState) => state.subtitleUser);

    const addNewComment = useCallback(() => {
        if (text) {
            const newComment = {
                userId: currentUser?.userId,
                author: props.commentAuthor || "N/A",
                comment: text,
                date: new Date().toISOString()
            };
            dispatch(addCueComment(props.index, newComment));
            setText("");
        }
    }, [currentUser, dispatch, props.commentAuthor, props.index, text]);

    const getDeleteButton = (cueIndex: number, commentIndex: number): ReactElement => (
        <TooltipWrapper
            tooltipId={`deleteCueCommentBtnTooltip-${cueIndex}-${commentIndex}`}
            text="Delete comment"
            placement="top"
        >
            <button
                data-testid="sbte-delete-cue-comment-button"
                style={{ float: "right" }}
                className="btn btn-outline-secondary sbte-btn-xs"
                onClick={(): AppThunk => dispatch(deleteCueComment(cueIndex, commentIndex))}
            >
                <i className="fa fa-trash" />
            </button>
        </TooltipWrapper>
    );

    return (
        <div
            className="sbte-medium-font sbte-white-background"
            style={{
                position: "relative",
                flex: "1",
                display: "flex",
                flexDirection: "column",
                borderRadius: "5px",
                padding: "10px 10px 5px 10px",
                marginBottom: "2px",
                marginLeft: "2px",
                marginRight: "2px",
            }}
        >
            {
                props.cue.comments?.map((comment: CueComment, index: number): ReactElement => (
                    <div style={{ marginBottom: "8px" }} key={`cueComment-${props.index}-${index}`}>
                        <span
                            className="sbte-cue-comment-user"
                            style={{
                                borderRadius: "5px",
                                padding: "1px 3px",
                                whiteSpace: "nowrap",
                                width: "80px",
                                marginRight: "5px",
                                float: "left",
                                textAlign: "center",
                                textOverflow: "ellipsis",
                                overflow: "hidden"
                            }}
                        >
                            {comment.author}
                        </span>
                        <span> {comment.comment} </span>
                        {
                            comment.userId === currentUser?.userId
                                ? getDeleteButton(props.index, index)
                                : null
                        }
                        <span
                            className="sbte-light-gray-text"
                            style={{
                                float: "right",
                                position: "absolute",
                                right: "40px"
                            }}
                        >
                            <i>{new Date(comment.date).toLocaleString()}</i>
                        </span>
                    </div>
                ))
            }
            {
                !props.cue.comments || props.cue.comments.length < 1
                    ? <div style={{ marginBottom: "8px" }}>No comments</div>
                    : null
            }
            <hr style={{
                borderTop: "2px solid lightgray",
                width: "100%",
                height: "0px",
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: "0",
                marginBottom: "5px"
            }}
            />
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <input
                    type="text"
                    value={text}
                    placeholder="Type your comment here"
                    style={{
                        borderStyle: "none",
                        width: "100%"
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setText(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>): void => {
                        if (e.keyCode === Character.ENTER) {
                            addNewComment();
                        }
                    }}
                />
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    style={{ float: "right", marginLeft: "5px" }}
                    onClick={addNewComment}
                    disabled={!text}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default CueComments;

