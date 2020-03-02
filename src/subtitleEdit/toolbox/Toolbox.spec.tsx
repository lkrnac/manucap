import "../../testUtils/initBrowserEnvironment";
import Accordion from "react-bootstrap/Accordion";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Card from "react-bootstrap/Card";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { Provider } from "react-redux";
import React from "react";
import { SubtitleSpecification } from "./model";
import SubtitleSpecificationsButton from "./SubtitleSpecificationsButton";
import ShiftTimeButton from "./shift/ShiftTimeButton";
import Toolbox from "./Toolbox";
import { mount } from "enzyme";
import { readSubtitleSpecification } from "./subtitleSpecificationSlice";
import testingStore from "../../testUtils/testingStore";

describe("Toolbox", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <Accordion defaultActiveKey="0" style={{ marginTop: "10px" }} className="sbte-toolbox">
                    <Card>
                        <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                            Toolbox
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body>
                                <ButtonToolbar>
                                    <KeyboardShortcuts />
                                    <SubtitleSpecificationsButton />
                                    <ShiftTimeButton />
                                </ButtonToolbar>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <Toolbox />
            </Provider>
        );
        testingStore.dispatch(readSubtitleSpecification({ enabled: false } as SubtitleSpecification));

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });
});
