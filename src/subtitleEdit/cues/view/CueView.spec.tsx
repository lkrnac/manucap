import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import React from "react";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";
import { CueDto, GlossaryMatchDto, Language, Track } from "../../model";
import CueView from "./CueView";
import { removeDraftJsDynamicValues } from "../../../testUtils/testUtils";
import { createTestingStore } from "../../../testUtils/testingStore";
import { updateEditingTrack } from "../../trackSlices";
import { AnyAction } from "@reduxjs/toolkit";

let testingStore = createTestingStore();

describe("CueView", () => {
    beforeEach(()=> {
       testingStore = createTestingStore();
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
                <CueView index={1} cue={cue} playerTime={1} className="testingClassName" showGlossaryTerms />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
            .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
    });

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
                <CueView index={1} cue={cue} playerTime={1} showGlossaryTerms />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
            .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
    });

    it("renders text in RTL direction", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language,
            default: true,
            mediaTitle: "Sample Polish",
            mediaLength: 4000,
            progress: 50
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
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
                dir="RTL"
            >
                text<br />wrapped
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView
                    index={1}
                    cue={cue}
                    playerTime={1}
                    showGlossaryTerms
                    languageDirection={testingTrack.language.direction}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.outerHTML)
            .toEqual(expectedText.container.innerHTML);
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
                <CueView index={1} cue={cue} playerTime={1} showGlossaryTerms />
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
                <CueView index={1} cue={cue} playerTime={1} showGlossaryTerms />
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
                <CueView index={1} cue={cue} playerTime={1} showGlossaryTerms />
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
                <CueView index={1} cue={cue} playerTime={1} showGlossaryTerms />
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
                <CueView index={1} cue={cue} playerTime={1} hideText showGlossaryTerms />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.outerHTML)
            .toEqual(expectedText.container.innerHTML);
    });

    it("renders source cue with glossary terms highlighted if enabled", () => {
        // GIVEN
        const glossary = [] as GlossaryMatchDto[];
        glossary.push({ source: "text", replacements: ["text replacement1", "text replacement2"]});
        glossary.push({ source: "Line", replacements: ["lineReplacement1"]});
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
            cueCategory: "DIALOGUE"
        } as CueDto;
        const expectedSourceCueContent = "<i>Source <b><span onclick=\"pickSetGlossaryTerm('lineReplacement1')\" " +
            "style=\"background-color: #D9E9FF;\">Line</span></b></i> <br>Wrapped " +
            "<span onclick=\"pickSetGlossaryTerm('text replacement1/text replacement2')\" " +
            "style=\"background-color: #D9E9FF;\">text</span>";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView index={1} cue={cue} playerTime={1} glossary={glossary} showGlossaryTerms />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
    });

    it("renders source cue without glossary terms highlighted if not enabled", () => {
        // GIVEN
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
            cueCategory: "DIALOGUE"
        } as CueDto;

        const expectedSourceCueContent = "<i>Source <b>Line</b></i> <br>Wrapped text";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView index={1} cue={cue} playerTime={1} showGlossaryTerms={false} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
    });

    it("sends simple glossary term to redux when clicked", () => {
        // GIVEN
        const glossary = [] as GlossaryMatchDto[];
        glossary.push({ source: "text", replacements: ["text replacement1", "text replacement2"]});
        glossary.push({ source: "Line", replacements: ["lineReplacement1"]});
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
            cueCategory: "DIALOGUE"
        } as CueDto;
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView index={1} cue={cue} playerTime={1} glossary={glossary} showGlossaryTerms />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelectorAll("span")[0]);

        // THEN
        expect(testingStore.getState().glossaryTerm).toEqual("lineReplacement1");
    });

    it("sends composite glossary term to redux when clicked", () => {
        // GIVEN
        const glossary = [] as GlossaryMatchDto[];
        glossary.push({ source: "text", replacements: ["text replacement1", "text replacement2", "repl3"]});
        glossary.push({ source: "Line", replacements: ["lineReplacement1"]});
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
            cueCategory: "DIALOGUE"
        } as CueDto;
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView index={1} cue={cue} playerTime={1} glossary={glossary} showGlossaryTerms />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelectorAll("span")[1]);

        // THEN
        expect(testingStore.getState().glossaryTerm).toEqual("text replacement1/text replacement2/repl3");
    });

    it("handles glossary case insensitively", () => {
        // GIVEN
        const glossary = [] as GlossaryMatchDto[];
        glossary.push({ source: "Line", replacements: ["replacement"]});
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text LINE"),
            cueCategory: "DIALOGUE"
        } as CueDto;

        const expectedSourceCueContent = "<i>Source <b><span onclick=\"pickSetGlossaryTerm('replacement')\" " +
            "style=\"background-color: #D9E9FF;\">Line</span></b></i> <br>Wrapped text " +
            "<span onclick=\"pickSetGlossaryTerm('replacement')\" " +
            "style=\"background-color: #D9E9FF;\">LINE</span>";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView index={1} cue={cue} playerTime={1} glossary={glossary} showGlossaryTerms />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);
    });

    it("handles glossary for multi word phrases", () => {
        // GIVEN
        const glossary = [] as GlossaryMatchDto[];
        glossary.push({ source: "Wrapped text", replacements: ["text replacement1", "text replacement2"]});
        glossary.push({ source: "Source Line", replacements: ["lineReplacement1"]});
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source Line</i> \nWrapped text"),
            cueCategory: "DIALOGUE"
        } as CueDto;

        const expectedSourceCueContent = "<i><span onclick=\"pickSetGlossaryTerm('lineReplacement1')\" " +
            "style=\"background-color: #D9E9FF;\">Source Line</span></i> <br>" +
            "<span onclick=\"pickSetGlossaryTerm('text replacement1/text replacement2')\" " +
            "style=\"background-color: #D9E9FF;\">Wrapped text</span>";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView index={1} cue={cue} playerTime={1} glossary={glossary} showGlossaryTerms />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);    });

    it("handles glossary with large number of items", () => {
        // GIVEN
        const glossary = [] as GlossaryMatchDto[];
        for (let idx = 1000; idx < 99999; idx++) {
            glossary.push({
                source: `Source Line ${idx + 1}`,
                replacements: [`Replacement for cue ${idx + 1}`]
            });
            glossary.push({
                source: `Wrapped text ${idx + 1}`,
                replacements: [`Text burrito ${idx + 1}`]
            });
        }
        const cue = {
            vttCue: new VTTCue(1, 2, "<i>Source Line 6732</i> \nWrapped text 9222"),
            cueCategory: "DIALOGUE"
        } as CueDto;

        const expectedSourceCueContent = "<i><span onclick=\"pickSetGlossaryTerm('Replacement for cue 6732')\" " +
            "style=\"background-color: #D9E9FF;\">Source Line 6732</span></i> <br>" +
            "<span onclick=\"pickSetGlossaryTerm('Text burrito 9222')\" " +
            "style=\"background-color: #D9E9FF;\">Wrapped text 9222</span>";

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueView index={1} cue={cue} playerTime={1} glossary={glossary} showGlossaryTerms />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelector(".sbte-cue-editor")?.innerHTML)
            .toEqual(expectedSourceCueContent);    });
});
