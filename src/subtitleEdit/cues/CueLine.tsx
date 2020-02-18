import React, { ReactElement } from "react";
import { CueDto } from "../model";
import CueEditLine from "./edit/CueEditLine";

interface Props {
    index: number;
    cue: CueDto;
    playerTime: number;
}

const CueLine = (props: Props): ReactElement => (
    <div style={{ display: "flex", paddingBottom: "5px" }}>
        <div
            className="sbte-cue-line-flap"
            style={{
                flex: "1 1 20px",
                paddingLeft: "8px",
                paddingTop: "10px",
            }}
        >
            {props.index + 1}
        </div>
        <CueEditLine index={props.index} cue={props.cue} playerTime={props.playerTime} />
    </div>
);

export default CueLine;
