import React, { ReactElement } from "react";
import { CueDto } from "../../model";
import { convertVttToHtml } from "../cueTextConverter";
import { cueCategoryToPrettyName } from "../cueUtils";
import { findPositionIcon } from "../cueUtils";
import { getTimeString } from "../timeUtils";
import sanitizeHtml from "sanitize-html";

interface Props {
    index: number;
    cue: CueDto;
    playerTime: number;
}

const CueViewLine = (props: Props): ReactElement => (
    <div style={{ display: "flex" }}>
        <div
            className="sbte-cue-line-left-section"
            style={{
                flex: "1 1 300px",
                display: "flex",
                flexDirection: "column",
                paddingLeft: "10px",
                paddingTop: "5px",
                justifyContent: "space-between"
            }}
        >
            <div style={{
                display: "flex",
                flexDirection: "column",
            }}
            >
                <div>{getTimeString(props.cue.vttCue.startTime)}</div>
                <div>{getTimeString(props.cue.vttCue.endTime)}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "5px" }}>
                <div className="sbte-small-font">{cueCategoryToPrettyName[props.cue.cueCategory]}</div>
                <div className="sbte-small-font" style={{ paddingRight: "10px" }}>
                    {findPositionIcon(props.cue.vttCue).iconText}
                </div>
            </div>
        </div>
        <div className="sbte-left-border" style={{ flex: "1 1 70%" }}>
            <div
                className="sbte-cue-editor"
                style={{
                    flexBasis: "50%",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px",
                    height: "100%",
                    width: "100%"
                }}
                dangerouslySetInnerHTML={{
                    __html: convertVttToHtml(sanitizeHtml(props.cue.vttCue.text, { allowedTags: ["b", "i", "u"]}))
                }}
            />
        </div>
    </div>
);

export default CueViewLine;
