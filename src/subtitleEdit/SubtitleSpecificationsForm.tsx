import React, {
    ReactElement
} from "react";
import "../styles.css";
import Checkbox from "../common/Checkbox";
import {SubtitleSpecification} from "./model";

export interface Props {
    subTitleSpecifications: SubtitleSpecification;
}

const SubtitleSpecificationsForm = (props: Props): ReactElement => {
    return (
        <div>
            <form>
                <div className="form-group">
                    <Checkbox
                        id="enabled"
                        checked={props.subTitleSpecifications.enabled}
                        labelMessage="Enabled"
                        readonly={true}
                    />
                </div>
                <hr/>
                <div className="form-group">
                    <Checkbox
                        id="audioDescription"
                        checked={props.subTitleSpecifications.audioDescription}
                        labelMessage="Audio Description"
                        readonly={true}
                    />
                </div>
                <div className="form-group">
                    <Checkbox
                        id="onScreenText"
                        checked={props.subTitleSpecifications.onScreenText}
                        labelMessage="On-Screen Text"
                        readonly={true}
                    />
                </div>
                <div className="form-group">
                    <Checkbox
                        id="spokenAudio"
                        checked={props.subTitleSpecifications.spokenAudio}
                        labelMessage="Spoken Audio"
                        readonly={true}
                    />
                </div>
                <div className="form-group">
                    <label>Speaker Identification</label>
                    <select className="form-control" disabled
                            value={props.subTitleSpecifications.speakerIdentification}>
                        <option value="NONE">None</option>
                        <option value="FIRST_NAME">First Name</option>
                        <option value="FULLNAME">Full Name</option>
                        <option value="NUMBERED">Numbered</option>
                        <option value="GENDER">Gender</option>
                        <option value="GENRE">Genre</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Dialogue Style</label>
                    <select className="form-control" disabled
                            value={props.subTitleSpecifications.dialogueStyle}>
                        <option value="LINE_BREAKS">Line Breaks</option>
                        <option value="DOUBLE_CHEVRON">Double Chevron</option>
                        <option value="NO_DASHES">No Dashes</option>
                    </select>
                </div>
                <hr/>
                <div className="form-row">
                    <div className="form-group col">
                        <label className="form-label">
                            Max Lines Per Caption
                        </label>
                        <select className="form-control" disabled
                                value={props.subTitleSpecifications.maxLinesPerCaption}>
                            <option key={props.subTitleSpecifications.maxLinesPerCaption}
                                    value={props.subTitleSpecifications.maxLinesPerCaption}>
                                {props.subTitleSpecifications.maxLinesPerCaption}
                            </option>
                        </select>
                    </div>
                    <div className="form-group col">
                        <label className="form-label">
                            Max Characters Per Caption
                        </label>
                        <select className="form-control" disabled
                                value={props.subTitleSpecifications.maxCharactersPerLine}>
                            <option key={props.subTitleSpecifications.maxCharactersPerLine}
                                    value={props.subTitleSpecifications.maxCharactersPerLine}>
                                {props.subTitleSpecifications.maxCharactersPerLine}
                            </option>
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col">
                        <label className="form-label">
                            Min Caption Duration In Seconds
                        </label>
                        <select className="form-control" disabled
                                value={props.subTitleSpecifications.minCaptionDurationInMillis}>
                            <option key={props.subTitleSpecifications.minCaptionDurationInMillis}
                                    value={props.subTitleSpecifications.minCaptionDurationInMillis}>
                                {props.subTitleSpecifications.minCaptionDurationInMillis}
                            </option>
                        </select>
                    </div>
                    <div className="form-group col">
                        <label className="form-label">
                            Max Caption Duration In Seconds
                        </label>
                        <select className="form-control" disabled
                                value={props.subTitleSpecifications.maxCaptionDurationInMillis}>
                            <option key={props.subTitleSpecifications.maxCaptionDurationInMillis}
                                    value={props.subTitleSpecifications.maxCaptionDurationInMillis}>
                                {props.subTitleSpecifications.maxCaptionDurationInMillis}
                            </option>
                        </select>
                    </div>
                </div>
                <hr/>
                <div className="form-group">
                    <label>Speaker Identification</label>
                    <textarea className="form-control" disabled rows={2} value={props.subTitleSpecifications.comments}/>
                </div>
            </form>
        </div>
    );
};

export default SubtitleSpecificationsForm;
