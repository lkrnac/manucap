import "../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { AnyAction } from "@reduxjs/toolkit";
import { CueActionsPanel } from "./CueActionsPanel";
import { CueDto } from "../model";
import CueEdit from "./edit/CueEdit";
import CueLine, { CueLineRowProps } from "./CueLine";
import CueView from "./view/CueView";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import { removeDraftJsDynamicValues } from "../../testUtils/testUtils";
import { createTestingStore } from "../../testUtils/testingStore";
import { updateCues, updateEditingCueIndex } from "./cueSlices";

let testingStore = createTestingStore();

const cues = [
    { vttCue: new VTTCue(0, 0, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

const sourceCue = { vttCue: new VTTCue(0, 0, "Source Line 1"), cueCategory: "DIALOGUE" } as CueDto;

describe("CueLine", () => {
    beforeEach(() => { testingStore = createTestingStore(); });
    it("renders edit line in captioning mode", () => {
        // GIVEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div
                        className="sbte-cue-line-flap"
                        style={{
                            paddingTop: "10px",
                            width: "30px",
                            color: "white",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textAlign: "center"
                        }}
                    >
                        2
                    </div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <div />
                        <CueEdit index={1} cue={cues[1]} playerTime={0} />
                    </div>
                    <CueActionsPanel index={1} editingCueIndex={1} cue={cues[1]} />
                </div>
            </Provider>
        );
        const cueWithSource = { cue: cues[1] };
        const cueLineRowProps = { playerTime: 0 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={1}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
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
                    <div
                        className="sbte-cue-line-flap"
                        style={{
                            paddingTop: "10px",
                            width: "30px",
                            color: "white",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textAlign: "center"
                        }}
                    >
                        2
                    </div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <div />
                        <CueView index={1} cue={cues[1]} playerTime={0} className="sbte-gray-100-background" />
                    </div>
                    <CueActionsPanel index={1} editingCueIndex={-1} cue={cues[1]} />
                </div>
            </Provider>
        );
        const cueWithSource = { cue: cues[1] };
        const cueLineRowProps = { playerTime: 0 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={1}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders corrupted view line in captioning mode", () => {
        // GIVEN
        const corruptedCue = {
            vttCue: new VTTCue(0, 0, "Editing Line 1"),
            cueCategory: "DIALOGUE",
            corrupted: true
        } as CueDto;
        const cueWithSource = { cue: corruptedCue };
        const cueLineRowProps = { playerTime: 0 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={1}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.find(CueView).props().className).toEqual("sbte-background-error-darker");
    });

    it("renders middle edit line in translation mode", () => {
        // GIVEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div
                        className="sbte-cue-line-flap"
                        style={{
                            paddingTop: "10px",
                            width: "30px",
                            color: "white",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textAlign: "center"
                        }}
                    >
                        2
                    </div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            index={1}
                            cue={sourceCue}
                            playerTime={0}
                            className="sbte-bottom-border sbte-gray-100-background"
                        />
                        <CueEdit index={1} cue={cues[1]} playerTime={0} />
                    </div>
                    <CueActionsPanel index={1} editingCueIndex={1} cue={cues[1]} sourceCue={sourceCue} />
                </div>
            </Provider>
        );
        const cueWithSource = { cue: cues[1], sourceCue };
        const cueLineRowProps = { playerTime: 0 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={1}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders last edit line in translation mode", () => {
        // GIVEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div
                        className="sbte-cue-line-flap"
                        style={{
                            paddingTop: "10px",
                            width: "30px",
                            color: "white",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textAlign: "center"
                        }}
                    >
                        2
                    </div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            index={1}
                            cue={sourceCue}
                            playerTime={0}
                            className="sbte-bottom-border sbte-gray-100-background"
                        />
                        <CueEdit index={1} cue={cues[1]} playerTime={0} />
                    </div>
                    <CueActionsPanel index={1} editingCueIndex={1} cue={cues[1]} sourceCue={sourceCue} lastCue />
                </div>
            </Provider>
        );
        const cueWithSource = { cue: cues[1], sourceCue };
        const cueLineRowProps = { playerTime: 0, cuesLength: 1 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={1}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
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
                    <div
                        className="sbte-cue-line-flap"
                        style={{
                            paddingTop: "10px",
                            width: "30px",
                            color: "white",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textAlign: "center"
                        }}
                    >
                        2
                    </div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            index={1}
                            cue={sourceCue}
                            playerTime={0}
                            className="sbte-bottom-border sbte-gray-100-background"
                        />
                        <CueView index={1} cue={cues[1]} playerTime={0} className="sbte-gray-100-background" />
                    </div>
                    <CueActionsPanel index={1} editingCueIndex={-1} cue={cues[1]} sourceCue={sourceCue} />
                </div>
            </Provider>
        );
        const cueWithSource = { cue: cues[1], sourceCue };
        const cueLineRowProps = { playerTime: 0 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={1}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders corrupted view line in translation mode", () => {
        // GIVEN
        const corruptedCue = {
            vttCue: new VTTCue(0, 0, "Editing Line 1"),
            cueCategory: "DIALOGUE",
            corrupted: true
        } as CueDto;
        const cueWithSource = { cue: corruptedCue, sourceCue };
        const cueLineRowProps = { playerTime: 0 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={1}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.find(CueView).at(0).props().className)
            .toEqual("sbte-bottom-border sbte-background-error-darker");
        expect(actualNode.find(CueView).at(0).props().className)
            .toEqual("sbte-bottom-border sbte-background-error-darker");
    });

    it("renders empty line in translation mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div
                        className="sbte-cue-line-flap"
                        style={{
                            paddingTop: "10px",
                            width: "30px",
                            color: "white",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textAlign: "center"
                        }}
                    >
                        2
                    </div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            index={1}
                            cue={sourceCue}
                            playerTime={0}
                            className="sbte-bottom-border sbte-gray-100-background"
                        />
                        <CueView
                            index={1}
                            cue={sourceCue}
                            playerTime={0}
                            hideText
                            className="sbte-gray-200-background"
                        />
                    </div>
                    <CueActionsPanel index={1} editingCueIndex={-1} sourceCue={sourceCue} />
                </div>
            </Provider>
        );
        const cueWithSource = { sourceCue };
        const cueLineRowProps = { playerTime: 0 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={1}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });
    const cueWithSource = { cue: cues[1] };
    const cueLineRowProps = { playerTime: 1 } as CueLineRowProps;

    it("passes down properties to cue view component", () => {
        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={1}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
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
        const cueWithSource = { cue: cues[1] };
        const cueLineRowProps = { playerTime: 0 } as CueLineRowProps;

        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={1}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={onClickHandler}
                />
            </Provider>
        );

        // WHEN
        actualNode.simulate("click");

        // THEN
        expect(onClickHandler).toBeCalled();
    });

    it("passes down parameters into actions panel component", () => {
        // WHEN
        const cueWithSource = { cue: cues[1], sourceCue };
        const cueLineRowProps = { playerTime: 0, cuesLength: 2 } as CueLineRowProps;
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={1}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        const actualProps = actualNode.find(CueActionsPanel).props();
        expect(actualProps.index).toEqual(1);
        expect(actualProps.editingCueIndex).toEqual(1);
        expect(actualProps.cue).toEqual(cues[1]);
        expect(actualProps.sourceCue).toEqual(sourceCue);
        expect(actualProps.lastCue).toEqual(true);
    });

    it("passes down rowReference to ", () => {
        // GIVEN
        const cueWithSource = { cue: cues[1] };
        const cueLineRowProps = { playerTime: 0 } as CueLineRowProps;
        const rowRef = React.createRef() as React.RefObject<HTMLDivElement>;

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={1}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={rowRef}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(rowRef.current).toEqual(actualNode.find("div").at(0).instance());
    });
});
