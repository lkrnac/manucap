import "../../testUtils/initBrowserEnvironment";

import { AnyAction } from "redux";
import { Provider } from "react-redux";
import Icon from "@mdi/react";
import { mdiSync } from "@mdi/js";
import { fireEvent, render } from "@testing-library/react";

import { createTestingStore } from "../../testUtils/testingStore";
import SyncCuesButton from "./SyncCuesButton";
import { setSaveTrack } from "../cues/saveSlices";
import { updateEditingTrack } from "../trackSlices";
import { CueDto, Language, Track } from "../model";
import { updateSourceCues } from "../cues/view/sourceCueSlices";

let testingStore = createTestingStore();

const testTranslationTrack = {
    type: "TRANSLATION",
    language: { id: "fr-FR", name: "French (France)" } as Language,
    sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
    timecodesUnlocked: true
} as Track;

describe("SyncCuesButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(updateEditingTrack(testTranslationTrack as Track) as {} as AnyAction);
    });
    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button className="mc-sync-cues-button flex items-center">
                <Icon path={mdiSync} size={1.25} />
                <span className="pl-4">Sync Cues</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SyncCuesButton onClick={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders disabled if timecodes are unlocked", () => {
        // GIVEN
        testingStore.dispatch(
            updateEditingTrack( { ...testTranslationTrack, timecodesUnlocked: false } as Track) as {} as AnyAction);
        const expectedNode = render(
            <button className="mc-sync-cues-button flex items-center" disabled>
                <Icon path={mdiSync} size={1.25} />
                <span className="pl-4">Sync Cues</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SyncCuesButton onClick={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("syncs sues when button is clicked", () => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        const testingCues = [{ vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" }] as CueDto[];
        testingStore.dispatch(updateSourceCues(testingCues) as {} as AnyAction);

        const actualNode = render(
            <Provider store={testingStore}>
                <SyncCuesButton onClick={jest.fn()} />
            </Provider>
        );

        // WHEN
        const button = actualNode.container.querySelector(".mc-sync-cues-button")!;
        fireEvent.click(button);

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });

    it("unsets the track id on button click", () => {
        // GIVEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SyncCuesButton onClick={jest.fn()} />
            </Provider>
        );

        // WHEN
        const button = actualNode.container.querySelector(".mc-sync-cues-button")!;
        fireEvent.click(button);

        // THEN
        expect(testingStore.getState().editingTrack.id).not.toBeDefined();
    });
});
