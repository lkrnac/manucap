import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";
import SubtitleSpecificationsForm from "./SubtitleSpecificationsForm";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";

describe("SubtitleSpecificationsForm", () => {
    it("renders", () => {
        // GIVEN
        const subTitleSpecifications = {
            "subtitleSpecificationId":"3f458b11-2996-41f5-8f22-0114c7bc84db",
            "projectId":"68ed2f59-c5c3-4956-823b-d1f9f26585fb",
            "enabled":true,
            "audioDescription":true,
            "onScreenText":true,
            "spokenAudio":true,
            "speakerIdentification":"NUMBERED",
            "dialogueStyle":"DOUBLE_CHEVRON",
            "maxLinesPerCaption":null,
            "maxCharactersPerLine":null,
            "minCaptionDurationInMillis":null,
            "maxCaptionDurationInMillis":null,
            "comments":"This is a sample comment"
        };

        const expectedNode = enzyme.mount(
            <div>
                <Form>
                    <Form.Group controlId="enabled">
                        <Form.Check disabled type="checkbox" label="Enabled" id="enabled" checked/>
                    </Form.Group>
                    <hr/>
                    <Form.Group controlId="audioDescription">
                        <Form.Check disabled type="checkbox" label="Audio Description" id="audioDescription" checked/>
                    </Form.Group>
                    <Form.Group controlId="onScreenText">
                        <Form.Check disabled type="checkbox" label="On-Screen Text" id="onScreenText" checked/>
                    </Form.Group>
                    <Form.Group controlId="spokenAudio">
                        <Form.Check disabled type="checkbox" label="Spoken Audio" id="spokenAudio" checked/>
                    </Form.Group>
                    <Form.Group controlId="speakerIdentification">
                        <Form.Label>Speaker Identification</Form.Label>
                        <Form.Control disabled as="select">
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
                        <Form.Control disabled as="select">
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
                        <Form.Control disabled as="textarea" rows="2" value="This is a sample comment"/>
                    </Form.Group>
                </Form>
            </div>
        );

        // WHEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore} >
                <SubtitleSpecificationsForm subTitleSpecifications={subTitleSpecifications}/>
            </Provider>
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

});
