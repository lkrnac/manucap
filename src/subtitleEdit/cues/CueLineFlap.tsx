import React, { ReactElement } from "react";

interface Props {
    rowIndex: number;
}

const CueLineFlap = (props: Props): ReactElement => {
    return (
        <div
            className="sbte-cue-line-flap"
            style={{
                paddingTop: "10px",
                width: "30px",
                color: "white",
                fontSize: "11px",
                fontWeight: "bold",
                textAlign: "center"
            }}
        >
            {props.rowIndex + 1}
        </div>
    );
};

export default CueLineFlap;
