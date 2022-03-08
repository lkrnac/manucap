import "../../testUtils/initBrowserEnvironment";
import { AnyAction } from "@reduxjs/toolkit";
import KeyboardShortcuts from "./keyboardShortcuts/KeyboardShortcuts";
import { Provider } from "react-redux";
import ShiftTimeButton from "./shift/ShiftTimeButton";
import { SubtitleSpecification } from "./model";
import SubtitleSpecificationsButton from "./subtitleSpecifications/SubtitleSpecificationsButton";
import Toolbox from "./Toolbox";
import { readSubtitleSpecification } from "./subtitleSpecifications/subtitleSpecificationSlice";
import testingStore from "../../testUtils/testingStore";
import CaptionOverlapToggle from "./CaptionOverlapToggle";
import ExportTrackCuesButton from "./export/ExportTrackCuesButton";
import ImportTrackCuesButton from "./ImportTrackCuesButton";
import { Language, Track } from "../model";
import { updateEditingTrack } from "../trackSlices";
import SyncCuesButton from "./SyncCuesButton";
import SearchReplaceButton from "./SearchReplaceButton";
import ExportSourceTrackCuesButton from "./export/ExportSourceTrackCuesButton";
import { fireEvent, render } from "@testing-library/react";
import MergeCuesButton from "./MergeCuesButton";
import CueCommentsToggle from "./CueCommentsToggle";
import TimecodesLockToggle from "./TimecodesLockToggle";
import WaveformToggle from "./WaveformToggle";
import { Menu } from "@headlessui/react";

describe("Toolbox", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    style={{ marginTop: "20px" }}
                    className="sbte-button-toolbar"
                >
                    <SubtitleSpecificationsButton />
                    <SearchReplaceButton />
                    <ImportTrackCuesButton handleImport={jest.fn()} />
                    <ExportTrackCuesButton handleExport={jest.fn()} />
                    <Menu>
                        <Menu.Button id="cue-line-category">
                            <i className="fas fa-ellipsis-h" />
                        </Menu.Button>
                        <Menu.Items style={{ minWidth: "220px", width: "220px" }}>
                            <Menu.Item as="li">
                                <div className="tw-dropdown-item">
                                    <KeyboardShortcuts />
                                </div>
                            </Menu.Item>
                            <Menu.Item as="li">
                                <div className="tw-dropdown-item">
                                    <ShiftTimeButton />
                                </div>
                            </Menu.Item>
                            <Menu.Item as="li">
                                <div className="tw-dropdown-item">
                                    <CaptionOverlapToggle />
                                </div>
                            </Menu.Item>
                            <Menu.Item as="li">
                                <div className="tw-dropdown-item">
                                    <MergeCuesButton />
                                </div>
                            </Menu.Item>
                            <Menu.Item as="li" className="sbte-dropdown-item">
                                <div className="tw-dropdown-item">
                                    <CueCommentsToggle />
                                </div>
                            </Menu.Item>
                            <Menu.Item as="li" className="sbte-dropdown-item">
                                <div className="tw-dropdown-item">
                                    <WaveformToggle />
                                </div>
                            </Menu.Item>
                        </Menu.Items>
                    </Menu>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <Toolbox handleExportSourceFile={jest.fn()} handleExportFile={jest.fn()} handleImportFile={jest.fn()} />
            </Provider>
        );
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );

        // THEN
        expect(actualNode.container.outerHTML)
            .toEqual(expectedNode.container.outerHTML);
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

        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    style={{ marginTop: "10px" }}
                    className="sbte-toolbox"
                >
                    <SubtitleSpecificationsButton />
                    <SearchReplaceButton />
                    <ImportTrackCuesButton handleImport={jest.fn()} />
                    <ExportSourceTrackCuesButton handleExport={jest.fn()} />
                    <ExportTrackCuesButton handleExport={jest.fn()} />
                    <Menu>
                        <Menu.Button id="cue-line-category">
                            <i className="fas fa-ellipsis-h" />
                        </Menu.Button>
                        <Menu.Items style={{ minWidth: "220px", width: "220px" }}>
                            <Menu.Item as="li">
                                <div className="tw-dropdown-item">
                                    <KeyboardShortcuts />
                                </div>
                            </Menu.Item>
                            <Menu.Item as="li">
                                <div className="tw-dropdown-item">
                                    <ShiftTimeButton />
                                </div>
                            </Menu.Item>
                            <Menu.Item as="li">
                                <div className="tw-dropdown-item">
                                    <CaptionOverlapToggle />
                                </div>
                            </Menu.Item>
                            <Menu.Item as="li" className="sbte-dropdown-item">
                                <div className="tw-dropdown-item">
                                    <SyncCuesButton />
                                </div>
                            </Menu.Item>
                            <Menu.Item as="li">
                                <div className="tw-dropdown-item">
                                    <MergeCuesButton />
                                </div>
                            </Menu.Item>
                            <Menu.Item as="li" className="sbte-dropdown-item">
                                <div className="tw-dropdown-item">
                                    <CueCommentsToggle />
                                </div>
                            </Menu.Item>
                            <Menu.Item as="li" className="sbte-dropdown-item">
                                <div className="tw-dropdown-item">
                                    <TimecodesLockToggle />
                                </div>
                            </Menu.Item>
                            <Menu.Item as="li" className="sbte-dropdown-item">
                                <div className="tw-dropdown-item">
                                    <WaveformToggle />
                                </div>
                            </Menu.Item>
                        </Menu.Items>
                    </Menu>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <Toolbox handleExportSourceFile={jest.fn()} handleExportFile={jest.fn()} handleImportFile={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML)
            .toEqual(expectedNode.container.outerHTML);
    });

    it("passes exportFile function to export file button", () => {
        // GIVEN
        const mockExportFile = jest.fn();
        const actualNode = render(
            <Provider store={testingStore}>
                <Toolbox
                    handleExportSourceFile={jest.fn()}
                    handleExportFile={mockExportFile}
                    handleImportFile={jest.fn()}
                />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-export-button") as Element);

        // THEN
        expect(mockExportFile).toHaveBeenCalled();
    });

    it("passes importFile function to import file button", () => {
        // GIVEN
        const mockImportFile = jest.fn();
        const actualNode = render(
            <Provider store={testingStore}>
                <Toolbox
                    handleExportSourceFile={jest.fn()}
                    handleExportFile={jest.fn()}
                    handleImportFile={mockImportFile}
                />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-import-button") as Element);

        // THEN
        expect(mockImportFile).toHaveBeenCalled();
    });

    it("passes exportSourceFile function to source export file button", () => {
        // GIVEN
        const mockExportSourceFile = jest.fn();
        const actualNode = render(
            <Provider store={testingStore}>
                <Toolbox
                    handleExportSourceFile={mockExportSourceFile}
                    handleExportFile={jest.fn()}
                    handleImportFile={jest.fn()}
                />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-export-source-button") as Element);

        // THEN
        expect(mockExportSourceFile).toHaveBeenCalled();
    });
});
