import "../../testUtils/initBrowserEnvironment";
import Accordion from "react-bootstrap/Accordion";
import { AnyAction } from "@reduxjs/toolkit";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Card from "react-bootstrap/Card";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { Provider } from "react-redux";
import React from "react";
import ShiftTimeButton from "./shift/ShiftTimeButton";
import { SubtitleSpecification } from "./model";
import SubtitleSpecificationsButton from "./SubtitleSpecificationsButton";
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
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

    it("Pass shows as true value to SubtitleSpecificationsButton", () => {
        //WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <Toolbox showSubtitleSpecification />
            </Provider>
        );

        // THEN
        expect(actualNode.find(SubtitleSpecificationsButton).props().show).toEqual(true);
    });

    it("Pass shows value as false to SubtitleSpecificationsButton if missing", () => {
        //WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <Toolbox />
            </Provider>
        );

        // THEN
        expect(actualNode.find(SubtitleSpecificationsButton).props().show).toEqual(false);
    });
});
