import "../../../testUtils/initBrowserEnvironment";
import React from "react";
import { Provider } from "react-redux";
import testingStore from "../../../testUtils/testingStore";
import CueLineFlap from "./CueLineFlap";
import { CueLineState } from "../../model";
import { render } from "@testing-library/react";

describe("CueLineFlap", () => {
    it("renders without content", () => {
        // GIVEN
        const expectedNode = render(
            <div
                className="sbte-cue-line-flap"
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative",
                    minHeight: "unset"
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
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} cueLineState={CueLineState.NONE} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders good cue line", () => {
        // GIVEN
        const expectedNode = render(
            <div
                className="sbte-cue-line-flap-good"
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative",
                    minHeight: "unset"
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
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} cueLineState={CueLineState.GOOD} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders good cue and edit disabled line", () => {
        // GIVEN
        const expectedNode = render(
            <div
                className="sbte-cue-line-flap-good"
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative",
                    minHeight: "unset"
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
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} cueLineState={CueLineState.GOOD} editDisabled />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders corrupted cue line", () => {
        // GIVEN
        const expectedNode = render(
            <div
                className="sbte-cue-line-flap-error"
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative",
                    minHeight: "unset"
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
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} cueLineState={CueLineState.ERROR} showErrors />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders corrupted and edit disabled cue line", () => {
        // GIVEN
        const expectedNode = render(
            <div
                className="sbte-cue-line-flap-error"
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative",
                    minHeight: "unset"
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
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} cueLineState={CueLineState.ERROR} editDisabled />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders good enabled cue with 0 comments", () => {
        // GIVEN
        const expectedNode = render(
            <div
                className="sbte-cue-line-flap-good"
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative",
                    minHeight: "unset"
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
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} cueLineState={CueLineState.GOOD} cueCommentsCount={0} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders good enabled cue with 1 comment", () => {
        // GIVEN
        const expectedNode = render(
            <div
                className="sbte-cue-line-flap-good"
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative",
                    minHeight: "unset"
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
                        bottom: "50px",
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
                        bottom: "30px",
                        fontSize: "14px"
                    }}
                >
                    <i className="fa fa-comments" />
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
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} cueLineState={CueLineState.GOOD} cueCommentsCount={1} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders good disabled cue with 1 comment", () => {
        // GIVEN
        const expectedNode = render(
            <div
                className="sbte-cue-line-flap-good"
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative",
                    minHeight: "100px"
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
                        bottom: "50px",
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
                        bottom: "30px",
                        fontSize: "14px"
                    }}
                >
                    <i className="fa fa-comments" />
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
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} cueLineState={CueLineState.GOOD} editDisabled cueCommentsCount={1} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders corrupted disabled cue with 3 comments", () => {
        // GIVEN
        const expectedNode = render(
            <div
                className="sbte-cue-line-flap-error"
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative",
                    minHeight: "100px"
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
                        bottom: "50px",
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
                        bottom: "30px",
                        fontSize: "14px"
                    }}
                >
                    <i className="fa fa-comments" />
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
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} cueLineState={CueLineState.ERROR} editDisabled cueCommentsCount={3} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });
});
