import "../../testUtils/initBrowserEnvironment";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { SubtitleSpecification } from "./model";
import SubtitleSpecificationsButton from "./subtitleSpecifications/SubtitleSpecificationsButton";
import Toolbox from "./Toolbox";
import { readSubtitleSpecification } from "./subtitleSpecifications/subtitleSpecificationSlice";
import testingStore from "../../testUtils/testingStore";
import ExportTrackCuesButton from "./export/ExportTrackCuesButton";
import ImportTrackCuesButton from "./ImportTrackCuesButton";
import { Language, Track } from "../model";
import { updateEditingTrack } from "../trackSlices";
import SearchReplaceButton from "./SearchReplaceButton";
import { fireEvent, render } from "@testing-library/react";
import ExportSourceTrackCuesButton from "./export/ExportSourceTrackCuesButton";

describe("Toolbox", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    className="tw-mt-6 tw-space-x-2 tw-flex tw-items-center tw-z-[100]
                        tw-justify-center sbte-button-toolbar"
                >
                    <SubtitleSpecificationsButton />
                    <SearchReplaceButton />
                    <ImportTrackCuesButton handleImport={jest.fn()} />
                    <ExportTrackCuesButton handleExport={jest.fn()} />
                    <button
                        className="tw-select-none dropdown-toggle btn btn-secondary tw-flex
                                tw-items-center tw-justify-center"
                        aria-controls="toolboxMenu"
                        aria-haspopup="true"
                    >
                        <i className="fas fa-ellipsis-h" />
                    </button>
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
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
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
                    className="tw-mt-6 tw-space-x-2 tw-flex tw-items-center
                        tw-z-[100] tw-justify-center sbte-button-toolbar"
                >
                    <SubtitleSpecificationsButton />
                    <SearchReplaceButton />
                    <ImportTrackCuesButton handleImport={jest.fn()} />
                    <ExportSourceTrackCuesButton handleExport={jest.fn()} />
                    <ExportTrackCuesButton handleExport={jest.fn()} />
                    <button
                        className="tw-select-none dropdown-toggle btn btn-secondary tw-flex
                                tw-items-center tw-justify-center"
                        aria-controls="toolboxMenu"
                        aria-haspopup="true"
                    >
                        <i className="fas fa-ellipsis-h" />
                    </button>
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
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
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
