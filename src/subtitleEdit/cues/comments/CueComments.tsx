import React, { ReactElement } from "react";
import { CueComment } from "../../model";

interface Props {
    rowIndex: number;
    comments?: CueComment[];
}

const CueComments = (props: Props): ReactElement => {
    console.log(props.comments);
    return (
        <div className="sbte-cue-comments sbte-medium-font">
            {
                props.comments?.map((comment: CueComment): ReactElement => (
                    <div className="sbte-cue-comment">
                        <span className="sbte-cue-comment-user">{comment.userName}</span>
                        <span> {comment.comment} </span>
                        <span className="sbte-light-gray-text"><i>{comment.date}</i></span>
                    </div>
                ))
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
                    placeholder="Type your comment here"
                    className="sbte-cue-comment-input"
                />
                <button type="button" className="btn btn-sm btn-outline-secondary" style={{ float: "right" }}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default CueComments;

