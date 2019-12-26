import React, {
    ReactElement
} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import "../styles.css";

export interface Props {
    subTitleSpecifications: any;
}

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
                        <Form.Control disabled as="select">
                            <option>1</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} controlId="maxCharactersPerLine">
                        <Form.Label>Max Characters Per Caption</Form.Label>
                        <Form.Control disabled as="select">
                            <option>1</option>
                        </Form.Control>
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col} controlId="minCaptionDurationInMillis">
                        <Form.Label>Min Caption Duration In Seconds</Form.Label>
                        <Form.Control disabled as="select">
                            <option>1</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} controlId="maxCaptionDurationInMillis">
                        <Form.Label>Max Caption Duration In Seconds</Form.Label>
                        <Form.Control disabled as="select">
                            <option>1</option>
                        </Form.Control>
                    </Form.Group>
                </Form.Row>
                <hr/>
                <Form.Group controlId="comments">
                    <Form.Label>Comments</Form.Label>
                    <Form.Control disabled as="textarea" rows="2" value={props.subTitleSpecifications.comments} />
                </Form.Group>
            </Form>
        </div>
    );
};

export default SubtitleSpecificationsForm;
