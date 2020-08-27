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
import ExportTrackCuesButton from "./ExportTrackCuesButton";
import ImportTrackCuesButton from "./ImportTrackCuesButton";
import { Language, Track } from "../model";
import { updateEditingTrack } from "../trackSlices";
import SyncCuesButton from "./SyncCuesButton";
import SearchReplaceButton from "./SearchReplaceButton";

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
                                    <ExportTrackCuesButton handleExport={jest.fn()} />
                                    <ImportTrackCuesButton handleImport={jest.fn()} />
                                    <SearchReplaceButton />
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
                <Toolbox handleExportFile={jest.fn()} handleImportFile={jest.fn()} />
            </Provider>
        );
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

    it("renders for translation track", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            language: { id: "it-IT", name: "Italian" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

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
                                    <ExportTrackCuesButton handleExport={jest.fn()} />
                                    <ImportTrackCuesButton handleImport={jest.fn()} />
                                    <SearchReplaceButton />
                                    <SyncCuesButton />
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
                <Toolbox handleExportFile={jest.fn()} handleImportFile={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("passes exportFile function to export file button", () => {
        // GIVEN
        const mockExportFile = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore}>
                <Toolbox handleExportFile={mockExportFile} handleImportFile={jest.fn()} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-export-button").simulate("click");

        // THEN
        expect(mockExportFile).toHaveBeenCalled();
    });

    it("passes importFile function to import file button", () => {
        // GIVEN
        const mockImportFile = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore}>
                <Toolbox handleExportFile={jest.fn()} handleImportFile={mockImportFile} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-import-button").simulate("click");

        // THEN
        expect(mockImportFile).toHaveBeenCalled();
    });
});
