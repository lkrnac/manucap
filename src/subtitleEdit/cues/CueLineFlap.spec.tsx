import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import testingStore from "../../testUtils/testingStore";
import CueLineFlap from "./CueLineFlap";
import { CueDto } from "../model";

describe("CueLineFlap", () => {
    it("renders", () => {
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

    it("renders good cue", () => {
        // GIVEN
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
        const cue = { vttCue: new VTTCue(0, 3, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto;

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} cue={cue} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders corrupted cue", () => {
        // GIVEN
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
        const cue = { vttCue: new VTTCue(0, 0, "Caption Line 1"), cueCategory: "DIALOGUE", corrupted: true } as CueDto;

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} cue={cue} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
});
