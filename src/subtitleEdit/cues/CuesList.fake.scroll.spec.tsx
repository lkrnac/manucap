import React, { ReactElement } from "react";
import { act } from "react-dom/test-utils";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";

import { CueDto, Language, Track } from "../model";
import { updateCues } from "./cuesListActions";
import { updateSourceCues } from "./view/sourceCueSlices";
import CuesList from "./CuesList";
import { createTestingStore } from "../../testUtils/testingStore";
import { reset } from "./edit/editorStatesSlice";
import { updateEditingCueIndex } from "./edit/cueEditorSlices";

interface SmartScrollProps {
    startAt: number;
}

globalThis["startAtStorage"] = [];
jest.mock("@dotsub/react-smart-scroll", () =>
    (props: SmartScrollProps): ReactElement => {
        globalThis["startAtStorage"].push(props.startAt);
        return <div>SmartScroll</div>;
    }
);

const testingTranslationTrack = {
    type: "TRANSLATION",
    language: { id: "fr-FR", name: "French (France)" } as Language,
    sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
} as Track;

let testingStore = createTestingStore();

describe("CuesList", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(reset() as {} as AnyAction);
        globalThis["startAtStorage"] = [];
    });

    it("starts at correct index when times are synced in translation mode", async () => {
        // GIVEN
        const targetCues = [
            { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);

        // WHEN
        await act(async () => {
            render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
                </Provider>
            );
        });

        // THEN
        expect(globalThis["startAtStorage"]).toEqual([2, undefined]);
    });

    it("starts at correct index when target cue end time is shorter", async () => {
        // GIVEN
        const targetCues = [
            { vttCue: new VTTCue(1, 1.5, "Target Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1.5, 3.5, "Target Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(3.5, 4, "Target Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const sourceCues = [
            { vttCue: new VTTCue(1, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(3, 4, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];


        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);

        // WHEN
        await act(async () => {
            render(
                <Provider store={testingStore}>
                    <CuesList editingTrack={testingTranslationTrack} currentPlayerTime={0} />
                </Provider>
            );
        });

        // THEN
        expect(globalThis["startAtStorage"]).toEqual([1, undefined]);
    });
});
