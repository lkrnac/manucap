import React, {
    ReactElement
} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import "../styles.css";

const SubtitleSpecificationsForm = (): ReactElement => {
    return (
        <div>
            <Form>
                <Form.Group controlId="enabled">
                    <Form.Check disabled type="checkbox" label="Enabled" id="enabled"/>
                </Form.Group>
                <hr/>
                <Form.Group controlId="audioDescription">
                    <Form.Check disabled type="checkbox" label="Audio Description" id="audioDescription"/>
                </Form.Group>
                <Form.Group controlId="onScreenText">
                    <Form.Check disabled type="checkbox" label="On-Screen Text" id="onScreenText"/>
                </Form.Group>
                <Form.Group controlId="spokenAudio">
                    <Form.Check disabled type="checkbox" label="Spoken Audio" id="spokenAudio"/>
                </Form.Group>
                <Form.Group controlId="speakerIdentification">
                    <Form.Label>Speaker Identification</Form.Label>
                    <Form.Control disabled as="select">
                        <option>First Name</option>
                    </Form.Control>
                </Form.Group>
                <Form.Group controlId="dialogueStyle">
                    <Form.Label>Dialogue Style</Form.Label>
                    <Form.Control disabled as="select">
                        <option>Line Breaks</option>
                    </Form.Control>
                </Form.Group>
                <hr/>
                <Form.Row>
                    <Form.Group as={Col} controlId="maxLinesPerCaption">
                        <Form.Label>Max Lines Per Caption</Form.Label>
                        <Form.Control disabled as="select">
                            <option>n/a</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} controlId="maxCharactersPerLine">
                        <Form.Label>Max Characters Per Caption</Form.Label>
                        <Form.Control disabled as="select">
                            <option>n/a</option>
                        </Form.Control>
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col} controlId="minCaptionDurationInMillis">
                        <Form.Label>Min Caption Duration In Seconds</Form.Label>
                        <Form.Control disabled as="select">
                            <option>n/a</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} controlId="maxCaptionDurationInMillis">
                        <Form.Label>Max Caption Duration In Seconds</Form.Label>
                        <Form.Control disabled as="select">
                            <option>n/a</option>
                        </Form.Control>
                    </Form.Group>
                </Form.Row>
                <hr/>
                <Form.Group controlId="comments">
                    <Form.Label>Comments</Form.Label>
                    <Form.Control disabled as="textarea" rows="2" />
                </Form.Group>
            </Form>
        </div>
    );
};

export default SubtitleSpecificationsForm;
