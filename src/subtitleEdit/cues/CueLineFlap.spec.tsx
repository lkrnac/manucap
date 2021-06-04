import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { Provider } from "react-redux";
import testingStore from "../../testUtils/testingStore";
import CueLineFlap from "./CueLineFlap";
import { CueLineState } from "../model";
import { render } from "@testing-library/react";
import { AnyAction } from "@reduxjs/toolkit";
import { showSplitMerge } from "./splitMerge/splitMergeSlices";
import { addCuesToMergeList } from "./cuesListActions";

describe("CueLineFlap", () => {
    it("renders without content", () => {
        // GIVEN
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                </div>
                <div
                    className="sbte-cue-line-flap"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.NONE}
                    workingCues={testingStore.getState().cues[0]}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders good cue line", () => {
        // GIVEN
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    workingCues={testingStore.getState().cues[0]}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders good cue and edit disabled line", () => {
        // GIVEN
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa fa-lock" />
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    workingCues={testingStore.getState().cues[0]}
                    editDisabled
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders corrupted cue line", () => {
        // GIVEN
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                </div>
                <div
                    className="sbte-cue-line-flap-error"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fas fa-exclamation-triangle" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.ERROR}
                    workingCues={testingStore.getState().cues[0]}
                    showErrors
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders corrupted and edit disabled cue line", () => {
        // GIVEN
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                </div>
                <div
                    className="sbte-cue-line-flap-error"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa fa-lock" />
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fas fa-exclamation-triangle" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.ERROR}
                    workingCues={testingStore.getState().cues[0]}
                    editDisabled
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders for enabled cue line when split/merge mode is activated", () => {
        // GIVEN
        testingStore.dispatch(showSplitMerge(true) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <input
                        type="checkbox"
                        className="sbte-cue-line-flap-checkbox"
                    />
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    workingCues={testingStore.getState().cues[0]}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders for disabled cue line when split/merge mode is activated", () => {
        // GIVEN
        testingStore.dispatch(showSplitMerge(true) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <input
                        type="checkbox"
                        className="sbte-cue-line-flap-checkbox"
                        disabled
                    />
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa fa-lock" />
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    workingCues={testingStore.getState().cues[0]}
                    editDisabled
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders for cue line when split/merge mode is activated and no contiguous cue is checked", () => {
        // GIVEN
        testingStore.dispatch(showSplitMerge(true) as {} as AnyAction);
        testingStore.dispatch(addCuesToMergeList({ index: 3 }) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <input
                        type="checkbox"
                        className="sbte-cue-line-flap-checkbox"
                        disabled
                    />
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    workingCues={testingStore.getState().cues[0]}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders for cue line when split/merge mode is activated and a contiguous cue is checked", () => {
        // GIVEN
        testingStore.dispatch(showSplitMerge(true) as {} as AnyAction);
        testingStore.dispatch(addCuesToMergeList({ index: 1 }) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <input
                        type="checkbox"
                        className="sbte-cue-line-flap-checkbox"
                    />
                </div>
                <div
                    className="sbte-cue-line-flap-good"
                    style={{
                        textAlign: "center",
                        width: "30px",
                        color: "white",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <div
                        style={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            fontWeight: "bold"
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "30px",
                            fontSize: "14px"
                        }}
                    >
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            left: "0",
                            right: "0",
                            bottom: "10px",
                            fontSize: "14px"
                        }}
                    >
                        <i className="fa fa-check" />
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap
                    rowIndex={0}
                    cueLineState={CueLineState.GOOD}
                    workingCues={testingStore.getState().cues[0]}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });
});
