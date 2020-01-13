import React, {ReactElement} from "react";
import {SubtitleSpecification} from "./model";

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

const SubtitleSpecificationsForm = (props: Props): ReactElement => {
    return (
        <div>
            <div>
                <label><strong>Enabled:&nbsp;</strong></label>
                <label>{props.subTitleSpecifications.enabled ? "Yes" : "No"}</label>
            </div>
            {props.subTitleSpecifications.enabled ? (
                <div>
                    <hr/>
                    <div style={{display: "flex", marginRight: "20px"}}>
                        <div style={{flexFlow: "column"}}>
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
                        <hr/>
                        <div style={{flexFlow: "column"}}>
                            <div>
                                <label><strong>Max Lines Per Caption:&nbsp;</strong></label>
                                <label>{props.subTitleSpecifications.maxLinesPerCaption}</label>
                            </div>
                            <div>
                                <label><strong>Max Characters Per Caption:&nbsp;</strong></label>
                                <label>{props.subTitleSpecifications.maxCharactersPerLine}</label>
                            </div>
                            <div>
                                <label><strong>Min Caption Duration In Seconds:&nbsp;</strong></label>
                                <label>{props.subTitleSpecifications.minCaptionDurationInMillis}</label>
                            </div>
                            <div>
                                <label><strong>Max Caption Duration In Seconds:&nbsp;</strong></label>
                                <label>{props.subTitleSpecifications.maxCaptionDurationInMillis}</label>
                            </div>
                        </div>
                    </div>
                    <hr/>
                    <div>
                        <label><strong>Comments:&nbsp;</strong></label>
                        <label>{props.subTitleSpecifications.comments}</label>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default SubtitleSpecificationsForm;
