import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import testingStore from "../../testUtils/testingStore";
import CueLineFlap from "./CueLineFlap";
import { CueLineDto } from "../model";

describe("CueLineFlap", () => {
    it("renders without content", () => {
        // GIVEN
        const expectedNode = mount(
            <div
                className="sbte-cue-line-flap"
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative"
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
                        bottom: "10px",
                        fontSize: "14px"
                    }}
                >
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders good cue line", () => {
        // GIVEN
        const targetCuesWithIndexes = [
            { index: 0, cue: { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" }},
            { index: 1, cue: { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" }},
            { index: 2, cue: { vttCue: new VTTCue(2, 3, "Editing Line 3"), cueCategory: "DIALOGUE" }}
        ];

        const cueLine = {
            sourceCues: [{ index: 0, cue: { vttCue: new VTTCue(0, 3, "Source Line 1"), cueCategory: "DIALOGUE" }}],
            targetCues: targetCuesWithIndexes
        } as CueLineDto;

        const expectedNode = mount(
            <div
                className="sbte-cue-line-flap-good"
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative"
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
                        bottom: "10px",
                        fontSize: "14px"
                    }}
                >
                    <i className="fa fa-check" />
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} cueLine={cueLine} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with first target cue corrupted", () => {
        // GIVEN
        const targetCuesWithIndexes = [
            { index: 0, cue: { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE", corrupted: true }},
            { index: 1, cue: { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" }},
            { index: 2, cue: { vttCue: new VTTCue(2, 3, "Editing Line 3"), cueCategory: "DIALOGUE" }}
        ];

        const cueLine = {
            sourceCues: [{ index: 0, cue: { vttCue: new VTTCue(0, 3, "Source Line 1"), cueCategory: "DIALOGUE" }}],
            targetCues: targetCuesWithIndexes
        } as CueLineDto;

        const expectedNode = mount(
            <div
                className="sbte-cue-line-flap-error"
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative"
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
                        bottom: "10px",
                        fontSize: "14px"
                    }}
                >
                    <i className="fas fa-exclamation-triangle" />
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} cueLine={cueLine} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with second target cue corrupted", () => {
        // GIVEN
        const targetCuesWithIndexes = [
            { index: 0, cue: { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" }},
            { index: 1, cue: { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE", corrupted: true }},
            { index: 2, cue: { vttCue: new VTTCue(2, 3, "Editing Line 3"), cueCategory: "DIALOGUE" }}
        ];

        const cueLine = {
            sourceCues: [{ index: 0, cue: { vttCue: new VTTCue(0, 3, "Source Line 1"), cueCategory: "DIALOGUE" }}],
            targetCues: targetCuesWithIndexes
        } as CueLineDto;

        const expectedNode = mount(
            <div
                className="sbte-cue-line-flap-error"
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative"
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
                        bottom: "10px",
                        fontSize: "14px"
                    }}
                >
                    <i className="fas fa-exclamation-triangle" />
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} cueLine={cueLine} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
});
