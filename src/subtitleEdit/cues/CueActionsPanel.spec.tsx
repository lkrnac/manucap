import "../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import AddCueLineButton from "./edit/AddCueLineButton";
import { AnyAction } from "@reduxjs/toolkit";
import { CueActionsPanel } from "./CueActionsPanel";
import { CueDto } from "../model";
import DeleteCueLineButton from "./edit/DeleteCueLineButton";
import PlayCueButton from "./PlayCueButton";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import { removeDraftJsDynamicValues } from "../../testUtils/testUtils";
import testingStore from "../../testUtils/testingStore";
import { updateCues } from "./cueSlices";
import { setSaveTrack } from "../trackSlices";

const cues = [
    { vttCue: new VTTCue(0, 0, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

const sourceCue = { vttCue: new VTTCue(0, 0, "Source Line 1"), cueCategory: "DIALOGUE" } as CueDto;

describe("CueActionsPanel", () => {
    it("renders for caption cue in edit mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div
                    style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                    className="sbte-gray-100-background sbte-left-border"
                >
                    <DeleteCueLineButton cueIndex={1} />
                    <PlayCueButton cue={cues[1]} />
                    <AddCueLineButton cueIndex={1} cue={cues[1]} />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} editingCueIndex={1} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));

    });

    it("renders for caption cue in view mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div
                    style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                    className="sbte-gray-100-background sbte-left-border"
                >
                    <div />
                    <PlayCueButton cue={cues[1]} />
                    <div />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} editingCueIndex={-1} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders for translation cue in view mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div
                    style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                    className="sbte-gray-100-background sbte-left-border"
                >
                    <div />
                    <PlayCueButton cue={cues[1]} />
                    <div />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} sourceCue={sourceCue} editingCueIndex={-1} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders for middle translation cue in edit mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div
                    style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                    className="sbte-gray-100-background sbte-left-border"
                >
                    <div />
                    <PlayCueButton cue={cues[1]} />
                    <div />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} sourceCue={sourceCue} editingCueIndex={1} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders for last translation cue in edit mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div
                    style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                    className="sbte-gray-100-background sbte-left-border"
                >
                    <div />
                    <PlayCueButton cue={cues[1]} />
                    <AddCueLineButton cueIndex={1} cue={cues[1]} />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} sourceCue={sourceCue} editingCueIndex={1} lastCue />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders for empty translation cue", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div
                    style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                    className="sbte-gray-100-background sbte-left-border"
                >
                    <div />
                    <div />
                    <div />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} sourceCue={sourceCue} editingCueIndex={-1} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("opens next cue line for editing when add button is clicked", () => {
        // GIVEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} editingCueIndex={1} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-add-cue-button").simulate("click");

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
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueActionsPanel index={0} cue={cues[0]} editingCueIndex={0} />
            </Provider>
        );
        actualNode.update();

        // WHEN
        actualNode.find(".sbte-delete-cue-button").simulate("click");

        // THEN
        expect(testingStore.getState().cues.length).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Cue 2");
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
    });


    it("calls saveTrack in redux store when delete button is clicked", (done) => {
        // GIVEN
        const mockSave = jest.fn();
        testingStore.dispatch(setSaveTrack(mockSave) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueActionsPanel index={1} cue={cues[1]} editingCueIndex={1} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-delete-cue-button").simulate("click");

        // THEN
        setTimeout(() => {
            expect(mockSave).toBeCalled();
            done();
        }, 600);
    });

    it("doesn't propagate click event to parent DOM nodes", () => {
        // GIVEN
        const fakeEvent = { stopPropagation: jest.fn() };
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueActionsPanel index={0} cue={cues[0]} editingCueIndex={0} />
            </Provider>
        );

        // WHEN
        actualNode.simulate("click", fakeEvent);

        // THEN
        expect(fakeEvent.stopPropagation).toBeCalled();
    });
});
