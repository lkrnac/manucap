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
import CaptionOverlapToggle from "./CaptionOverlapToggle";
import { Language, Task, Track } from "../model";
import { updateEditingTrack, updateTask } from "../trackSlices";

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
                                <ButtonToolbar className="sbte-button-toolbar">
                                    <KeyboardShortcuts />
                                    <SubtitleSpecificationsButton />
                                    <ShiftTimeButton />
                                    <CaptionOverlapToggle />
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

    it("renders for translation task", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
        } as Track;
        const testingTask = {
            type: "TASK_REVIEW",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const expectedNode = mount(
            <Provider store={testingStore}>
                <Accordion defaultActiveKey="0" style={{ marginTop: "10px" }} className="sbte-toolbox">
                    <Card>
                        <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                            Toolbox
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body>
                                <ButtonToolbar className="sbte-button-toolbar">
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
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });
});
