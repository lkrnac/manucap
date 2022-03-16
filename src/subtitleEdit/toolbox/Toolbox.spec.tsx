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
import { removeHeadlessAttributes } from "../../testUtils/testUtils";
import ExportSourceTrackCuesButton from "./export/ExportSourceTrackCuesButton";

describe("Toolbox", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    className="tw-mt-6 tw-space-x-2 tw-flex tw-items-center tw-z-10
                        tw-justify-center sbte-button-toolbar"
                >
                    <div>
                        <SubtitleSpecificationsButton />
                    </div>
                    <div>
                        <SearchReplaceButton />
                    </div>
                    <div>
                        <ImportTrackCuesButton handleImport={jest.fn()} />
                    </div>
                    <div>
                        <ExportTrackCuesButton handleExport={jest.fn()} />
                    </div>
                    <div className="md:tw-relative tw-dropdown-wrapper">
                        <div
                            id=""
                            className="tw-cursor-pointer"
                            aria-haspopup="true"
                            aria-expanded="false"
                            aria-controls=""
                        >
                            <button className="tw-select-none dropdown-toggle btn btn-secondary">
                                <i className="fas fa-ellipsis-h" />
                            </button>
                        </div>
                        <div
                            className="tw-absolute tw-bottom-full tw-left-0
                                tw-min-w-[240px] tw-w-[240px]"
                        >
                            <div
                                className="tw-transition-all tw-duration-300 tw-ease-in-out tw-origin-bottom-left
                                    tw-opacity-100 tw-scale-100"
                                hidden
                                style={{ display: "none" }}
                            >
                                <ul className="tw-dropdown-menu" id="" role="menu" aria-labelledby="">
                                    <li id="" role="menuitem">
                                        <button className="dotsub-keyboard-shortcuts-button tw-dropdown-item">
                                            Keyboard Shortcuts
                                        </button>
                                    </li>
                                    <div className="tw-dropdown-separator" />
                                    <li id="" role="menuitem">
                                        <button
                                            className="dotsub-shift-time-button tw-dropdown-item"
                                            disabled
                                            title="Unlock timecodes to enable"
                                        >
                                            Shift Track Time
                                        </button>
                                    </li>
                                    <li id="" role="menuitem">
                                        <button
                                            className="tw-dropdown-item sbte-merge-cues-button"
                                            disabled
                                            title="Unlock timecodes to enable"
                                        >
                                            Merge Cues
                                        </button>
                                    </li>
                                    <div className="tw-dropdown-separator" />
                                    <li id="" role="menuitem">
                                        <button
                                            type="button"
                                            className="tw-dropdown-item tw-flex tw-items-center tw-justify-between"
                                        >
                                            Overlapping{" "}
                                            <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-secondary">
                                                NOT ALLOWED
                                            </span>
                                        </button>
                                    </li>
                                    <div className="tw-dropdown-separator" />
                                    <li className="sbte-dropdown-item" id="" role="menuitem">
                                        <button
                                            type="button"
                                            className="tw-dropdown-item tw-flex tw-items-center tw-justify-between"
                                        >
                                            Comments{" "}
                                            <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-secondary">
                                                HIDDEN
                                            </span>
                                        </button>
                                    </li>
                                    <li id="" role="menuitem">
                                        <button
                                            type="button"
                                            className="tw-dropdown-item tw-flex tw-items-center tw-justify-between"
                                        >
                                            Waveform{" "}
                                            <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-secondary">
                                                HIDDEN
                                            </span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
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
        const actual = removeHeadlessAttributes(actualNode.container.outerHTML);
        const expected = removeHeadlessAttributes(expectedNode.container.outerHTML);
        expect(actual).toEqual(expected);
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
                        tw-z-10 tw-justify-center sbte-button-toolbar"
                >
                    <div>
                        <SubtitleSpecificationsButton />
                    </div>
                    <div>
                        <SearchReplaceButton />
                    </div>
                    <div>
                        <ImportTrackCuesButton handleImport={jest.fn()} />
                    </div>
                    <div>
                        <ExportSourceTrackCuesButton handleExport={jest.fn()} />
                    </div>
                    <div>
                        <ExportTrackCuesButton handleExport={jest.fn()} />
                    </div>
                    <div className="md:tw-relative tw-dropdown-wrapper">
                        <div
                            id=""
                            className="tw-cursor-pointer"
                            aria-haspopup="true"
                            aria-expanded="false"
                            aria-controls=""
                        >
                            <button className="tw-select-none dropdown-toggle btn btn-secondary">
                                <i className="fas fa-ellipsis-h" />
                            </button>
                        </div>
                        <div className="tw-absolute tw-bottom-full tw-left-0 tw-min-w-[240px] tw-w-[240px]">
                            <div
                                className="tw-transition-all tw-duration-300 tw-ease-in-out tw-origin-bottom-left
                                    tw-opacity-100 tw-scale-100"
                                hidden
                                style={{ display: "none" }}
                            >
                                <ul className="tw-dropdown-menu" id="" role="menu" aria-labelledby="">
                                    <li id="" role="menuitem">
                                        <button className="dotsub-keyboard-shortcuts-button tw-dropdown-item">
                                            Keyboard Shortcuts
                                        </button>
                                    </li>
                                    <div className="tw-dropdown-separator" />
                                    <li id="" role="menuitem">
                                        <button
                                            className="dotsub-shift-time-button tw-dropdown-item"
                                            disabled
                                            title="Unlock timecodes to enable"
                                        >
                                            Shift Track Time
                                        </button>
                                    </li>
                                    <li id="" role="menuitem">
                                        <button
                                            className="sbte-sync-cues-button tw-dropdown-item"
                                            disabled
                                        >
                                            Sync Cues
                                        </button>
                                    </li>
                                    <li id="" role="menuitem">
                                        <button
                                            className="tw-dropdown-item sbte-merge-cues-button"
                                            disabled
                                            title="Unlock timecodes to enable"
                                        >
                                            Merge Cues
                                        </button>
                                    </li>
                                    <div className="tw-dropdown-separator" />
                                    <li id="" role="menuitem">
                                        <button
                                            type="button"
                                            className="tw-dropdown-item tw-flex tw-items-center tw-justify-between"
                                        >
                                            Timecodes{" "}
                                            <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-secondary">
                                                LOCKED
                                            </span>
                                        </button>
                                    </li>
                                    <li id="" role="menuitem">
                                        <button
                                            type="button"
                                            className="tw-dropdown-item tw-flex tw-items-center tw-justify-between"
                                        >
                                            Overlapping{" "}
                                            <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-secondary">
                                                NOT ALLOWED
                                            </span>
                                        </button>
                                    </li>
                                    <div className="tw-dropdown-separator" />
                                    <li className="sbte-dropdown-item" id="" role="menuitem">
                                        <button
                                            type="button"
                                            className="tw-dropdown-item tw-flex tw-items-center tw-justify-between"
                                        >
                                            Comments{" "}
                                            <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-secondary">
                                                HIDDEN
                                            </span>
                                        </button>
                                    </li>
                                    <li id="" role="menuitem">
                                        <button
                                            type="button"
                                            className="tw-dropdown-item tw-flex tw-items-center tw-justify-between"
                                        >
                                            Waveform{" "}
                                            <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-secondary">
                                                HIDDEN
                                            </span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
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
        const actual = removeHeadlessAttributes(actualNode.container.outerHTML);
        const expected = removeHeadlessAttributes(expectedNode.container.outerHTML);
        expect(actual).toEqual(expected);
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
