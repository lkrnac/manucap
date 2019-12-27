import React, {
    ReactElement
} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import {getNumberArrayByRange} from "../utils/selectUtils";
import "../styles.css";

export interface Props {
    subTitleSpecifications: any;
}

const captionFormattingRanges =
    {
        maxLinesPerCaption: {from: 1, to: 4},
        maxCharsPerLine: {from: 30, to: 80},
        minCaptionDurationInMillis: {from: 1, to: 4},
        maxCaptionDurationInMillis: {from: 2, to: 10}
    };

const SubtitleSpecificationsForm = (props: Props): ReactElement => {

    return (
        <div>
            <Form>
                <Form.Group controlId="enabled">
                    <Form.Check disabled type="checkbox" label="Enabled" id="enabled"
                                checked={props.subTitleSpecifications.enabled}/>
                </Form.Group>
                <hr/>
                <Form.Group controlId="audioDescription">
                    <Form.Check disabled type="checkbox" label="Audio Description" id="audioDescription"
                                checked={props.subTitleSpecifications.audioDescription}/>
                </Form.Group>
                <Form.Group controlId="onScreenText">
                    <Form.Check disabled type="checkbox" label="On-Screen Text" id="onScreenText"
                                checked={props.subTitleSpecifications.onScreenText}/>
                </Form.Group>
                <Form.Group controlId="spokenAudio">
                    <Form.Check disabled type="checkbox" label="Spoken Audio" id="spokenAudio"
                                checked={props.subTitleSpecifications.spokenAudio}/>
                </Form.Group>
                <Form.Group controlId="speakerIdentification">
                    <Form.Label>Speaker Identification</Form.Label>
                    <Form.Control disabled as="select" value={props.subTitleSpecifications.speakerIdentification}>
                        <option value="NONE">None</option>
                        <option value="FIRST_NAME">First Name</option>
                        <option value="FULLNAME">Full Name</option>
                        <option value="NUMBERED">Numbered</option>
                        <option value="GENDER">Gender</option>
                        <option value="GENRE">Genre</option>
                    </Form.Control>
                </Form.Group>
                <Form.Group controlId="dialogueStyle">
                    <Form.Label>Dialogue Style</Form.Label>
                    <Form.Control disabled as="select" value={props.subTitleSpecifications.dialogueStyle}>
                        <option value="LINE_BREAKS">Line Breaks</option>
                        <option value="DOUBLE_CHEVRON">Double Chevron</option>
                        <option value="NO_DASHES">No Dashes</option>
                    </Form.Control>
                </Form.Group>
                <hr/>
                <Form.Row>
                    <Form.Group as={Col} controlId="maxLinesPerCaption">
                        <Form.Label>Max Lines Per Caption</Form.Label>
                        <Form.Control disabled as="select"
                                      value={props.subTitleSpecifications.maxLinesPerCaption}>
                            {getNumberArrayByRange(
                                captionFormattingRanges.maxLinesPerCaption.from,
                                captionFormattingRanges.maxLinesPerCaption.to
                            ).map(value => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} controlId="maxCharactersPerLine">
                        <Form.Label>Max Characters Per Caption</Form.Label>
                        <Form.Control disabled as="select"
                                      value={props.subTitleSpecifications.maxCharactersPerLine}>
                            {getNumberArrayByRange(
                                captionFormattingRanges.maxCharsPerLine.from,
                                captionFormattingRanges.maxCharsPerLine.to
                            ).map(value => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col} controlId="minCaptionDurationInMillis">
                        <Form.Label>Min Caption Duration In Seconds</Form.Label>
                        <Form.Control disabled as="select"
                                      value={props.subTitleSpecifications.minCaptionDurationInMillis}>
                            {getNumberArrayByRange(
                                captionFormattingRanges.minCaptionDurationInMillis.from,
                                captionFormattingRanges.minCaptionDurationInMillis.to
                            ).map(value => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} controlId="maxCaptionDurationInMillis">
                        <Form.Label>Max Caption Duration In Seconds</Form.Label>
                        <Form.Control disabled as="select"
                                      value={props.subTitleSpecifications.maxCaptionDurationInMillis}>
                            {getNumberArrayByRange(
                                captionFormattingRanges.maxCaptionDurationInMillis.from,
                                captionFormattingRanges.maxCaptionDurationInMillis.to
                            ).map(value => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Form.Row>
                <hr/>
                <Form.Group controlId="comments">
                    <Form.Label>Comments</Form.Label>
                    <Form.Control disabled as="textarea" rows="2" value={props.subTitleSpecifications.comments}/>
                </Form.Group>
            </Form>
        </div>
    );
};

export default SubtitleSpecificationsForm;
