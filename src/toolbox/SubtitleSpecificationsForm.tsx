import React, {
    ReactElement
} from "react";
import "../styles.css";
import {SubtitleSpecification} from "./model";

export interface Props {
    subTitleSpecifications: SubtitleSpecification;
}

const SubtitleSpecificationsForm = (props: Props): ReactElement => {
    const getSpeakerIdentificationValue = (value: string): string => {
        switch (value) {
            case "NONE":
                return "None";
            case "FIRST_NAME":
                return "First Name";
            case "FULLNAME":
                return "Full Name";
            case "NUMBERED":
                return "Numbered";
            case "GENDER":
                return "Gender";
            case "GENRE":
                return "Genre";
            default:
                return "N/A";
        }
    };

    const getDialogueStyleValue = (value: string): string => {
        switch (value) {
            case "LINE_BREAKS":
                return "Line Breaks";
            case "DOUBLE_CHEVRON":
                return "Double Chevron";
            case "NO_DASHES":
                return "No Dashes";
            default:
                return "N/A";
        }
    };

    return (
        <div>
            <div className="form-group">
                <label><strong>Enabled:&nbsp;</strong></label>
                <label>{props.subTitleSpecifications.enabled ? "Yes" : "No"}</label>
            </div>
            {props.subTitleSpecifications.enabled ? (
                <div>
                    <hr/>
                    <div style={{display: "flex"}}>
                        <div style={{flexFlow: "column"}}>
                            <div className="form-group">
                                <label><strong> Audio Description:&nbsp;</strong></label>
                                <label>{props.subTitleSpecifications.audioDescription ? "Yes" : "No"}</label>
                            </div>
                            <div className="form-group">
                                <label><strong>On-Screen Text:&nbsp;</strong></label>
                                <label>{props.subTitleSpecifications.onScreenText ? "Yes" : "No"}</label>
                            </div>
                            <div className="form-group">
                                <label><strong>Spoken Audio:&nbsp;</strong></label>
                                <label>{props.subTitleSpecifications.spokenAudio ? "Yes" : "No"}</label>
                            </div>
                            <div className="form-group">
                                <label><strong>Speaker Identification:&nbsp;</strong></label>
                                <label>{getSpeakerIdentificationValue(props.subTitleSpecifications.speakerIdentification)}</label>
                            </div>
                            <div className="form-group">
                                <label><strong>Dialogue Style:&nbsp;</strong></label>
                                <label>{getDialogueStyleValue(props.subTitleSpecifications.dialogueStyle)}</label>
                            </div>
                        </div>
                        <hr/>
                        <div style={{flexFlow: "column"}}>
                            <div className="form-group">
                                <label><strong>Max Lines Per Caption:&nbsp;</strong></label>
                                <label>{props.subTitleSpecifications.maxLinesPerCaption}</label>
                            </div>
                            <div className="form-group">
                                <label><strong>Max Characters Per Caption:&nbsp;</strong></label>
                                <label>{props.subTitleSpecifications.maxCharactersPerLine}</label>
                            </div>
                            <div className="form-group">
                                <label><strong>Min Caption Duration In Seconds:&nbsp;</strong></label>
                                <label>{props.subTitleSpecifications.minCaptionDurationInMillis}</label>
                            </div>
                            <div className="form-group">
                                <label><strong>Max Caption Duration In Seconds:&nbsp;</strong></label>
                                <label>{props.subTitleSpecifications.maxCaptionDurationInMillis}</label>
                            </div>
                        </div>
                    </div>
                    <hr/>
                    <div className="form-group">
                        <label><strong>Comments:&nbsp;</strong></label>
                        <label>{props.subTitleSpecifications.comments}</label>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default SubtitleSpecificationsForm;
