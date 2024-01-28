import "../testUtils/initBrowserEnvironment";
import { createTestingStore } from "../testUtils/testingStore";
import { setSaveTrack } from "./cues/saveSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import CueListToolbar from "./CueListToolbar";
import { Language, Track } from "./model";
import Icon from "@mdi/react";
import {
    mdiChevronDoubleDown,
    mdiChevronDownBoxOutline,
    mdiChevronRightBoxOutline,
    mdiDebugStepInto,
    mdiPageFirst,
    mdiPageLast
} from "@mdi/js";

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
    progress: 50
} as Track;

let testingStore = createTestingStore();

describe("CueListToolbar", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    const saveTrack = jest.fn();
    beforeEach(() => {
        // GIVEN
        saveTrack.mockReset();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="space-x-2 flex items-center mt-1.5">
                    <button
                        className="mc-btn mc-btn-primary mc-view-all-tracks-mc-btn"
                        type="button"
                    >
                        View Track History
                    </button>
                    <button
                        id="jumpToFirstButton"
                        className="mc-btn mc-btn-light mc-jump-to-first-button"
                        type="button"
                        data-pr-tooltip="Scroll to top"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <Icon path={mdiPageFirst} size={1} />
                    </button>
                    <button
                        id="jumpToLastButton"
                        className="mc-btn mc-btn-light mc-jump-to-last-button"
                        type="button"
                        data-pr-tooltip="Scroll to bottom"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <Icon path={mdiPageLast} size={1} />
                    </button>
                    <button
                        id="editCueButton"
                        data-testid="mc-jump-to-edit-cue-button"
                        className="mc-btn mc-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to currently editing caption"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <Icon path={mdiChevronDownBoxOutline} size={1} />
                    </button>
                    <button
                        id="playbackCueButton"
                        data-testid="mc-jump-to-playback-cue-button"
                        className="mc-btn mc-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to caption in playback position"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <Icon path={mdiChevronRightBoxOutline} size={1} />
                    </button>
                    <button
                        hidden
                        id="translatedCueButton"
                        data-testid="mc-jump-to-last-translated-cue-button"
                        className="mc-btn mc-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to last translated caption"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <Icon path={mdiChevronDoubleDown} size={1} />
                    </button>
                    <button
                        id="cueErrorButton"
                        data-testid="mc-jump-error-cue-button"
                        className="mc-btn mc-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to next caption error"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <Icon path={mdiDebugStepInto} size={1} />
                    </button>
                    <span style={{ flexGrow: 2 }} />
                    <div className="space-x-4 flex items-center">
                        <div className="font-medium">
                            <span hidden className="flex items-center ">
                                <span className="leading-none" />
                                <i className="ml-2" />
                            </span>
                        </div>
                        <button
                            type="button"
                            className="mc-btn mc-btn-primary mc-complete-caption-mc-btn"
                        >
                            Complete
                        </button>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueListToolbar
                    editingTrack={testingTrack}
                    onComplete={jest.fn()}
                    onViewTrackHistory={jest.fn()}
                    saveState="NONE"
                />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with edit disabled", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="space-x-2 flex items-center mt-1.5">
                    <button
                        className="mc-btn mc-btn-primary mc-view-all-tracks-mc-btn"
                        type="button"
                    >
                        View Track History
                    </button>
                    <button
                        id="jumpToFirstButton"
                        className="mc-btn mc-btn-light mc-jump-to-first-button"
                        type="button"
                        data-pr-tooltip="Scroll to top"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <Icon path={mdiPageFirst} size={1} />
                    </button>
                    <button
                        id="jumpToLastButton"
                        className="mc-btn mc-btn-light mc-jump-to-last-button"
                        type="button"
                        data-pr-tooltip="Scroll to bottom"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <Icon path={mdiPageLast} size={1} />
                    </button>
                    <button
                        id="editCueButton"
                        data-testid="mc-jump-to-edit-cue-button"
                        className="mc-btn mc-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to currently editing caption"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <Icon path={mdiChevronDownBoxOutline} size={1} />
                    </button>
                    <button
                        id="playbackCueButton"
                        data-testid="mc-jump-to-playback-cue-button"
                        className="mc-btn mc-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to caption in playback position"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <Icon path={mdiChevronRightBoxOutline} size={1} />
                    </button>
                    <button
                        hidden
                        id="translatedCueButton"
                        data-testid="mc-jump-to-last-translated-cue-button"
                        className="mc-btn mc-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to last translated caption"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <Icon path={mdiChevronDoubleDown} size={1} />
                    </button>
                    <button
                        id="cueErrorButton"
                        data-testid="mc-jump-error-cue-button"
                        className="mc-btn mc-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to next caption error"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <Icon path={mdiDebugStepInto} size={1} />
                    </button>
                    <span style={{ flexGrow: 2 }} />
                    <div className="space-x-4 flex items-center">
                        <div className="font-medium">
                            <span className="text-green-primary">
                                Edits are disabled, task is already completed
                            </span>
                        </div>
                        <button
                            type="button"
                            className="mc-btn mc-btn-primary mc-complete-caption-mc-btn"
                            disabled
                        >
                            Complete
                        </button>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueListToolbar
                    editingTrack={testingTrack}
                    onComplete={jest.fn()}
                    onViewTrackHistory={jest.fn()}
                    editDisabled
                    saveState="NONE"
                />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

});
