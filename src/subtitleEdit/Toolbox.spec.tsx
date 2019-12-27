import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";
import Toolbox from "./Toolbox";
import KeyboardShortcuts from "./KeyboardShortcuts";
import SubtitleSpecifications from "./SubtitleSpecifications";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";

describe("Toolbox", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = enzyme.mount(
            <Accordion defaultActiveKey="0" style={{ marginTop: "10px"}}>
                <Card>
                    <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                        Toolbox
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <ButtonToolbar>
                                <KeyboardShortcuts />
                                <SubtitleSpecifications />
                            </ButtonToolbar>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        );

        // WHEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore} >
                <Toolbox />
            </Provider>
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });
});
