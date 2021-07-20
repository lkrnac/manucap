import React, { ReactElement } from "react";

interface Props {
    rowIndex: number;
}

const CueComments = (props: Props): ReactElement => (
    <div
        className="sbte-cue-comments"
        style={{
            position: "relative",
            flex: "1",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            borderRadius: "5px",
            padding: "10px",
            marginLeft: "10px",
            marginBottom: "5px"
        }}
    >
        {

        }
        <div style={{ marginBottom: "10px" }}>
            <span
                style={{
                        backgroundColor: "darkcyan",
                        color: "white",
                        borderRadius: "5px",
                        padding: "4px 6px",
                        whiteSpace: "nowrap"
                    }}
            >Reviewer
            </span> This is a comment on cue {props.rowIndex} <span style={{ color: "lightgray" }}>1 day ago</span>
        </div>
        <div style={{ marginBottom: "10px" }}>
            <span
                style={{
                        backgroundColor: "darkseagreen",
                        color: "white",
                        borderRadius: "5px",
                        padding: "4px 6px",
                        whiteSpace: "nowrap"
                    }}
            >Captioner
            </span> This is a long response comment <span style={{ color: "lightgray" }}>5 hours ago</span>
        </div>
        <div style={{ marginBottom: "10px" }}>
            <span style={{
                        backgroundColor: "darkcyan",
                        color: "white",
                        borderRadius: "5px",
                        padding: "4px 6px",
                        whiteSpace: "nowrap"
                    }}
            >Reviewer
            </span> This is a response comment <span style={{ color: "lightgray" }}>1 hour ago</span>
        </div>
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
        <div style={{ paddingTop: "5px" }}>
            <span style={{ color: "lightgray" }}>Type your comment here</span>
            <button type="button" className="btn btn-sm btn-primary" style={{ float: "right" }}>
                Send
            </button>
        </div>
    </div>
);

export default CueComments;

