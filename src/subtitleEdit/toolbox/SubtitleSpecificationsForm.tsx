import React, { ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import { SubtitleSpecification } from "./model";

export interface Props {
    subTitleSpecifications: SubtitleSpecification;
}

const speakerIdentificationValues = {
    NONE: "None",
    FIRST_NAME: "First Name",
    FULLNAME: "Full Name",
    NUMBERED: "Numbered",
    GENDER: "Gender",
    GENRE: "Genre"
};
const dialogueStyleValues = {
    LINE_BREAKS: "Line Breaks",
    DOUBLE_CHEVRON: "Double Chevron",
    NO_DASHES: "No Dashes"
};

const millisToSeconds = (millis: number | null): string => millis ? "" + (millis / 1000) : "n/a";

const SubtitleSpecificationsForm = (props: Props): ReactElement => (
    <>
        <label><strong>Enabled:&nbsp;</strong></label>
        <label>{props.subTitleSpecifications.enabled ? "Yes" : "No"}</label>
        {props.subTitleSpecifications.enabled ? (
            <>
                <hr />
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", marginRight: "20px" }}>
                        <div style={{ flexFlow: "column", flex: 1 }}>
                            <div>
                                <label><strong> Audio Description:&nbsp;</strong></label>
                                <label>{props.subTitleSpecifications.audioDescription ? "Yes" : "No"}</label>
                            </div>
                            <div>
                                <label><strong>On-Screen Text:&nbsp;</strong></label>
                                <label>{props.subTitleSpecifications.onScreenText ? "Yes" : "No"}</label>
                            </div>
                            <div>
                                <label><strong>Spoken Audio:&nbsp;</strong></label>
                                <label>{props.subTitleSpecifications.spokenAudio ? "Yes" : "No"}</label>
                            </div>
                            <div>
                                <label><strong>Speaker Identification:&nbsp;</strong></label>
                                <label>
                                    {speakerIdentificationValues[props.subTitleSpecifications.speakerIdentification]}
                                </label>
                            </div>
                            <div>
                                <label><strong>Dialogue Style:&nbsp;</strong></label>
                                <label>
                                    {dialogueStyleValues[props.subTitleSpecifications.dialogueStyle]}
                                </label>
                            </div>
                        </div>
                        <div style={{ flexFlow: "column", flex: 1 }}>
                            <div>
                                <label><strong>Max Lines Per Caption:&nbsp;</strong></label>
                                <label>
                                    {
                                        props.subTitleSpecifications.maxLinesPerCaption
                                            ? props.subTitleSpecifications.maxLinesPerCaption
                                            : "n/a"
                                    }
                                </label>
                            </div>
                            <div>
                                <label><strong>Max Characters Per Line:&nbsp;</strong></label>
                                <label>
                                    {
                                        props.subTitleSpecifications.maxCharactersPerLine
                                            ? props.subTitleSpecifications.maxCharactersPerLine
                                            : "n/a"
                                    }
                                </label>
                            </div>
                            <div>
                                <label><strong>Min Caption Duration In Seconds:&nbsp;</strong></label>
                                <label>
                                    {millisToSeconds(props.subTitleSpecifications.minCaptionDurationInMillis)}
                                </label>
                            </div>
                            <div>
                                <label><strong>Max Caption Duration In Seconds:&nbsp;</strong></label>
                                <label>
                                    {millisToSeconds(props.subTitleSpecifications.maxCaptionDurationInMillis)}
                                </label>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <label><strong>Comments:&nbsp;</strong></label>
                    <div className="sbte-subspec-freeform-text">{props.subTitleSpecifications.comments}</div>
                    <br />
                    <label><strong>Media Notes:&nbsp;</strong></label>
                    <ReactMarkdown
                        source={props.subTitleSpecifications.mediaNotes}
                        disallowedTypes={["html", "virtualHtml"]}
                        className="sbte-subspec-freeform-text"
                    />
                </div>
            </>
        ) : null}
    </>
);

export default SubtitleSpecificationsForm;
