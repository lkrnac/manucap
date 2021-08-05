import React, { ReactElement, useEffect, useState } from "react";
import { CueComment, CueDto } from "../../model";
import { useDispatch, useSelector } from "react-redux";
import { addCueComment, deleteCueComment } from "../cuesList/cuesListActions";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import Mousetrap from "mousetrap";
import { KeyCombination } from "../../utils/shortcutConstants";

interface Props {
    index: number;
    cue: CueDto;
    commentAuthor: string;
}

const CueComments = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const [text, setText] = useState("");
    const currentUser = useSelector((state: SubtitleEditState) => state.subtitleUser);

    const addNewComment = (): void => {
        if (text) {
            const newComment = {
                userId: currentUser?.userId,
                userName: props.commentAuthor || "N/A",
                comment: text,
                date: new Date().toLocaleString()
            };
            dispatch(addCueComment(props.index, newComment));
            setText("");
        }
    };

    useEffect(
        () => {
            Mousetrap.bind([KeyCombination.ENTER], addNewComment);
        },
        [addNewComment, text]
    );

    const getDeleteButton = (cueIndex: number, commentIndex: number): ReactElement => (
        <button
            style={{ float: "right" }}
            className="btn btn-outline-secondary sbte-btn-xs"
            onClick={(): AppThunk => dispatch(deleteCueComment(cueIndex, commentIndex))}
        >
            <i className="fa fa-trash" />
        </button>
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
                            {comment.userName}
                        </span>
                        <span> {comment.comment} </span>
                        {
                            currentUser?.userId === comment.userId
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
                            <i>{comment.date}</i>
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
                    className="mousetrap"
                    style={{
                        borderStyle: "none",
                        width: "100%"
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setText(e.target.value)}
                />
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    style={{ float: "right" }}
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

