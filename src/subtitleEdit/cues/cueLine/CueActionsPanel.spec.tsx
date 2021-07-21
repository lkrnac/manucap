import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import React from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, fireEvent } from "@testing-library/react";

import AddCueLineButton from "../edit/AddCueLineButton";
import { CueActionsPanel } from "./CueActionsPanel";
import { CueDto, Track } from "../../model";
import DeleteCueLineButton from "../edit/DeleteCueLineButton";
import PlayCueButton from "./PlayCueButton";
import { removeDraftJsDynamicValues } from "../../../testUtils/testUtils";
import { updateCues } from "../cuesList/cuesListActions";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { createTestingStore } from "../../../testUtils/testingStore";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback
}));

const cues = [
    { vttCue: new VTTCue(0, 0, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

let testingStore = createTestingStore();

describe("CueActionsPanel", () => {
    const saveTrack = jest.fn();

    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);
    });

    it("renders for caption cue in edit mode", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                    className="sbte-actions-panel sbte-gray-100-background sbte-left-border"
                >
                    <DeleteCueLineButton cueIndex={1} />
                    <PlayCueButton cue={cues[1]} />
                    <AddCueLineButton cueIndex={1} sourceCueIndexes={[]} />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} isEdit sourceCueIndexes={[]} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
            .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));

    });

    it("renders for caption cue in view mode", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                    className="sbte-actions-panel sbte-gray-100-background sbte-left-border"
                >
                    <div />
                    <PlayCueButton cue={cues[1]} />
                    <div />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} isEdit={false} sourceCueIndexes={[]} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
            .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
    });

    it("opens next cue line for editing when add button is clicked", () => {
        // GIVEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        const actualNode = render(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} isEdit sourceCueIndexes={[]} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);

        // THEN
        expect(testingStore.getState().editingCueIndex).toEqual(2);
    });

    it("deletes cue when delete button is clicked", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueActionsPanel index={0} cue={cues[0]} isEdit sourceCueIndexes={[]} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-delete-cue-button") as Element);

        // THEN
        expect(testingStore.getState().cues.length).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Cue 2");
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
    });


    it("calls saveTrack in redux store when delete button is clicked", () => {
        // GIVEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} isEdit sourceCueIndexes={[]} />
            </Provider>
        );
        saveTrack.mockReset();

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-delete-cue-button") as Element);

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });
});
