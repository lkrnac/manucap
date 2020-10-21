import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";

import { CueDto } from "../../model";
import CueView from "./CueView";
import { removeDraftJsDynamicValues } from "../../../testUtils/testUtils";
import testingStore from "../../../testUtils/testingStore";

describe("CueView", () => {
    it("renders", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(1, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto;

        const expectedNode = render(
            <Provider store={testingStore}>
                <div style={{ display: "flex" }}>
                    <div
                        className="sbte-cue-line-left-section"
                        style={{
                            flex: "1 1 300px",
                            display: "flex",
                            flexDirection: "column",
                            paddingLeft: "10px",
                            paddingTop: "5px",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{ display: "flex", flexDirection:"column" }}>
                            <div>00:00:01.000</div>
                            <div>00:00:02.000</div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between",  paddingBottom: "5px" }} >
                            <div className="sbte-small-font">Dialogue</div>
                            <div className="sbte-small-font" style={{ paddingRight: "10px" }}>↓↓</div>
                        </div>
                    </div>
                    <div className="sbte-left-border" style={{ flex: "1 1 70%" }}>
                        <div
                            className="sbte-cue-editor"
                            style={{
                                flexBasis: "50%",
                                paddingLeft: "10px",
                                paddingTop: "5px",
                                paddingBottom: "5px",
                                minHeight: "54px",
                                height: "100%",
                                width: "100%"
                            }}
                        >
                            Caption Line 1
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView index={1} cue={cue} playerTime={1} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
            .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
    });

    it("renders with class name parameter", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(1, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto;

        const expectedNode = render(
            <Provider store={testingStore}>
                <div style={{ display: "flex" }} className="testingClassName">
                    <div
                        className="sbte-cue-line-left-section"
                        style={{
                            flex: "1 1 300px",
                            display: "flex",
                            flexDirection: "column",
                            paddingLeft: "10px",
                            paddingTop: "5px",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{ display: "flex", flexDirection:"column" }}>
                            <div>00:00:01.000</div>
                            <div>00:00:02.000</div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between",  paddingBottom: "5px" }} >
                            <div className="sbte-small-font">Dialogue</div>
                            <div className="sbte-small-font" style={{ paddingRight: "10px" }}>↓↓</div>
                        </div>
                    </div>
                    <div className="sbte-left-border" style={{ flex: "1 1 70%" }}>
                        <div
                            className="sbte-cue-editor"
                            style={{
                                flexBasis: "50%",
                                paddingLeft: "10px",
                                paddingTop: "5px",
                                paddingBottom: "5px",
                                minHeight: "54px",
                                height: "100%",
                                width: "100%"
                            }}
                        >
                            Caption Line 1
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView index={1} cue={cue} playerTime={1} className="testingClassName" />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
            .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
    });

    it("converts VTT text to HTML", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(1, 2, "text\nwrapped"), cueCategory: "DIALOGUE" } as CueDto;
        const expectedText = render(
            <div
                className="sbte-cue-editor"
                style={{
                    flexBasis: "50%",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px",
                    height: "100%",
                    width: "100%"
                }}
            >
                text<br />wrapped
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView index={1} cue={cue} playerTime={1} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.outerHTML)
            .toEqual(expectedText.container.innerHTML);
    });

    it("sanitizes HTML for XSS attack", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "some<script>alert(\"problem\")</script>text"),
            cueCategory: "DIALOGUE"
        } as CueDto;
        const expectedText = render(
            <div
                className="sbte-cue-editor"
                style={{
                    flexBasis: "50%",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px",
                    height: "100%",
                    width: "100%"
                }}
            >
                sometext
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView index={1} cue={cue} playerTime={1} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.outerHTML)
            .toEqual(expectedText.container.innerHTML);
    });

    it("keeps selected styling (b,i,u) HTML tags", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<b>bold</b><i>italic</i><u>underline</u>"),
            cueCategory: "DIALOGUE"
        } as CueDto;
        const expectedText = render(
            <div
                className="sbte-cue-editor"
                style={{
                    flexBasis: "50%",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px",
                    height: "100%",
                    width: "100%"
                }}
            >
                <b>bold</b><i>italic</i><u>underline</u>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView index={1} cue={cue} playerTime={1} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.outerHTML)
            .toEqual(expectedText.container.innerHTML);
    });

    it("removed HTML tags that are not allowed", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<v speaker><div>some text</div>"),
            cueCategory: "DIALOGUE"
        } as CueDto;
        const expectedText = render(
            <div
                className="sbte-cue-editor"
                style={{
                    flexBasis: "50%",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px",
                    height: "100%",
                    width: "100%"
                }}
            >
                some text
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView index={1} cue={cue} playerTime={1} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.outerHTML)
            .toEqual(expectedText.container.innerHTML);
    });

    it("hides cue text if required", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "some text"),
            cueCategory: "DIALOGUE"
        } as CueDto;
        const expectedText = render(
            <div
                className="sbte-cue-editor"
                style={{
                    flexBasis: "50%",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px",
                    height: "100%",
                    width: "100%"
                }}
            />
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView index={1} cue={cue} playerTime={1} hideText />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.outerHTML)
            .toEqual(expectedText.container.innerHTML);
    });
});
