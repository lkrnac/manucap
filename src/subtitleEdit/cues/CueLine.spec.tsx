import "../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { updateCues, updateEditingCueIndex } from "./cueSlices";
import AddCueLineButton from "./edit/AddCueLineButton";
import { AnyAction } from "@reduxjs/toolkit";
import { CueDto } from "../model";
import CueEdit from "./edit/CueEdit";
import CueLine from "./CueLine";
import CueView from "./view/CueView";
import DeleteCueLineButton from "./edit/DeleteCueLineButton";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import { removeDraftJsDynamicValues } from "../../testUtils/testUtils";
import testingStore from "../../testUtils/testingStore";

const cues = [
    { vttCue: new VTTCue(0, 0, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

const sourceCue = { vttCue: new VTTCue(0, 0, "Source Line 1"), cueCategory: "DIALOGUE" } as CueDto;

describe("CueLine", () => {
    it("renders edit line in captioning mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div className="sbte-cue-line-flap" style={{ paddingLeft: "8px", paddingTop: "10px" }}>2</div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <div />
                        <CueEdit index={1} cue={cues[1]} playerTime={0} />
                    </div>
                    <div
                        style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                        className="sbte-gray-100-background sbte-left-border"
                    >
                        <DeleteCueLineButton cueIndex={1} />
                        <AddCueLineButton cueIndex={1} cue={cues[1]} />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} onClickHandler={(): void => undefined} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders view line in captioning mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div className="sbte-cue-line-flap" style={{ paddingLeft: "8px", paddingTop: "10px" }}>2</div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <div />
                        <CueView index={1} cue={cues[1]} playerTime={0} className="sbte-gray-100-background" />
                    </div>
                    <div
                        style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                        className="sbte-gray-100-background sbte-left-border"
                    >
                        <div />
                        <div />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} onClickHandler={(): void => undefined} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders middle edit line in translation mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div className="sbte-cue-line-flap" style={{ paddingLeft: "8px", paddingTop: "10px" }}>2</div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            index={1}
                            cue={sourceCue}
                            playerTime={0}
                            className="sbte-bottom-border sbte-gray-100-background"
                        />
                        <CueEdit index={1} cue={cues[1]} playerTime={0} />
                    </div>
                    <div
                        style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                        className="sbte-gray-100-background sbte-left-border"
                    >
                        <div />
                        <div />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    index={1}
                    cue={cues[1]}
                    playerTime={0}
                    sourceCue={sourceCue}
                    onClickHandler={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders last edit line in translation mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div className="sbte-cue-line-flap" style={{ paddingLeft: "8px", paddingTop: "10px" }}>2</div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            index={1}
                            cue={sourceCue}
                            playerTime={0}
                            className="sbte-bottom-border sbte-gray-100-background"
                        />
                        <CueEdit index={1} cue={cues[1]} playerTime={0} />
                    </div>
                    <div
                        style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                        className="sbte-gray-100-background sbte-left-border"
                    >
                        <div />
                        <AddCueLineButton cueIndex={1} cue={cues[1]} />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    index={1}
                    cue={cues[1]}
                    playerTime={0}
                    sourceCue={sourceCue}
                    onClickHandler={(): void => undefined}
                    lastCue
                />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders view line in translation mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div className="sbte-cue-line-flap" style={{ paddingLeft: "8px", paddingTop: "10px" }}>2</div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            index={1}
                            cue={sourceCue}
                            playerTime={0}
                            className="sbte-bottom-border sbte-gray-100-background"
                        />
                        <CueView index={1} cue={cues[1]} playerTime={0} className="sbte-gray-100-background" />
                    </div>
                    <div
                        style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                        className="sbte-gray-100-background sbte-left-border"
                    >
                        <div />
                        <div />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    index={1}
                    cue={cues[1]}
                    playerTime={0}
                    sourceCue={sourceCue}
                    onClickHandler={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders empty line in translation mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div className="sbte-cue-line-flap" style={{ paddingLeft: "8px", paddingTop: "10px" }}>2</div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            index={1}
                            cue={sourceCue}
                            playerTime={0}
                            className="sbte-bottom-border sbte-gray-100-background"
                        />
                        <CueView index={1} cue={sourceCue} playerTime={0} hideText className="bg-light" />
                    </div>
                    <div
                        style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                        className="sbte-gray-100-background sbte-left-border"
                    >
                        <div />
                        <div />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    index={1}
                    cue={undefined}
                    playerTime={0}
                    sourceCue={sourceCue}
                    onClickHandler={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("passes down properties", () => {
        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={1} onClickHandler={(): void => undefined} />
            </Provider>
        );

        // THEN
        const actualProps = actualNode.find(CueView).props();
        expect(actualProps.index).toEqual(1);
        expect(actualProps.cue).toEqual(cues[1]);
        expect(actualProps.playerTime).toEqual(1);
    });

    it("opens cue line for editing when clicked", () => {
        // GIVEN
        const onClickHandler = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} onClickHandler={onClickHandler} />
            </Provider>
        );

        // WHEN
        actualNode.simulate("click");

        // THEN
        expect(onClickHandler).toBeCalled();
    });

    it("opens next cue line for editing when add button is clicked", () => {
        // GIVEN
        testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} onClickHandler={(): void => undefined} />
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
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={0} cue={cues[0]} playerTime={0} onClickHandler={(): void => undefined} />
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
});
