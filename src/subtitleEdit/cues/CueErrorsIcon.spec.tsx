/**  * @jest-environment jsdom-sixteen  */
// TODO Remove above when we update to react-scripts with Jest 26:
// https://github.com/facebook/create-react-app/pull/8362
// eslint-disable-next-line
// https://stackoverflow.com/questions/61036156/react-typescript-testing-typeerror-mutationobserver-is-not-a-constructor#comment110029314_61039444

import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { fireEvent, render } from "@testing-library/react";
import CueErrorsIcon from "./CueErrorsIcon";
import { CueError } from "../model";
import { findByTextIgnoreTags } from "../../testUtils/testUtils";

describe("TooltipWrapper", () => {
    it("renders for single source cue error", async () => {
        // GIVEN
        const sourceCueErrors = [CueError.LINE_CHAR_LIMIT_EXCEEDED];
        const expectedContent = render(
            <div className="sbte-source-cues-classNames">
                <strong>Caption(s)</strong><br />
                <div><span>• Max Characters Per Line Exceeded</span><br /></div>
            </div>
        );

        //WHEN
        const actualNode = render(
            <CueErrorsIcon cueIndex={0} sourceCuesErrors={sourceCueErrors} />
        );

        fireEvent.mouseOver(actualNode.container.querySelector(".fa-exclamation-triangle") as Element);

        // THEN
        const sourceErrors = await actualNode.findByText((_content, node) =>
            findByTextIgnoreTags("Caption(s)", node));
        expect(sourceErrors.parentElement?.outerHTML).toEqual(expectedContent.container.innerHTML);
    });
    it("renders for multiple source cue errors", async () => {
        // GIVEN
        const sourceCueErrors = [
            CueError.LINE_CHAR_LIMIT_EXCEEDED,
            CueError.LINE_COUNT_EXCEEDED,
            CueError.TIME_GAP_OVERLAP
        ];
        const expectedContent = render(
            <div className="sbte-source-cues-classNames">
                <strong>Caption(s)</strong><br />
                <div><span>• Max Characters Per Line Exceeded</span><br /></div>
                <div><span>• Max Lines Per Caption Exceeded</span><br /></div>
                <div><span>• Cue Overlap</span><br /></div>
            </div>
        );

        //WHEN
        const actualNode = render(
            <CueErrorsIcon cueIndex={0} sourceCuesErrors={sourceCueErrors} />
        );

        fireEvent.mouseOver(actualNode.container.querySelector(".fa-exclamation-triangle") as Element);

        // THEN
        const sourceErrors = await actualNode.findByText((_content, node) =>
            findByTextIgnoreTags("Caption(s)", node));
        expect(sourceErrors.parentElement?.outerHTML).toEqual(expectedContent.container.innerHTML);
    });
    it("renders for single target cue error", async () => {
        // GIVEN
        const targetCueErrors = [CueError.LINE_CHAR_LIMIT_EXCEEDED];
        const expectedContent = render(
            <div className="sbte-target-cues-classNames">
                <strong>Translations(s)</strong><br />
                <div><span>• Max Characters Per Line Exceeded</span><br /></div>
            </div>
        );

        //WHEN
        const actualNode = render(
            <CueErrorsIcon cueIndex={0} targetCuesErrors={targetCueErrors} />
        );

        fireEvent.mouseOver(actualNode.container.querySelector(".fa-exclamation-triangle") as Element);

        // THEN
        const targetErrors = await actualNode.findByText((_content, node) =>
            findByTextIgnoreTags("Translations(s)", node));
        expect(targetErrors.parentElement?.outerHTML).toEqual(expectedContent.container.innerHTML);
    });
    it("renders for multiple target cue with errors", async () => {
        // GIVEN
        const targetCueErrors = [
            CueError.LINE_CHAR_LIMIT_EXCEEDED,
            CueError.LINE_COUNT_EXCEEDED,
            CueError.TIME_GAP_OVERLAP
        ];
        const expectedContent = render(
            <div className="sbte-target-cues-classNames">
                <strong>Translations(s)</strong><br />
                <div><span>• Max Characters Per Line Exceeded</span><br /></div>
                <div><span>• Max Lines Per Caption Exceeded</span><br /></div>
                <div><span>• Cue Overlap</span><br /></div>
            </div>
        );

        //WHEN
        const actualNode = render(
            <CueErrorsIcon cueIndex={0} targetCuesErrors={targetCueErrors} />
        );

        fireEvent.mouseOver(actualNode.container.querySelector(".fa-exclamation-triangle") as Element);

        // THEN
        const targetErrors = await actualNode.findByText((_content, node) =>
            findByTextIgnoreTags("Translations(s)", node));
        expect(targetErrors.parentElement?.outerHTML).toEqual(expectedContent.container.innerHTML);
    });
    it("renders for single source cue error and single target cue error", async () => {
        // GIVEN
        const sourceCueErrors = [CueError.LINE_CHAR_LIMIT_EXCEEDED];
        const targetCueErrors = [CueError.LINE_CHAR_LIMIT_EXCEEDED];
        const expectedContent = render(
            <>
                <div className="sbte-source-cues-classNames">
                    <strong>Caption(s)</strong><br />
                    <div><span>• Max Characters Per Line Exceeded</span><br /></div>
                </div>
                <div className="sbte-target-cues-classNames">
                    <strong>Translations(s)</strong><br />
                    <div><span>• Max Characters Per Line Exceeded</span><br /></div>
                </div>
            </>
        );

        //WHEN
        const actualNode = render(
            <CueErrorsIcon cueIndex={0} sourceCuesErrors={sourceCueErrors} targetCuesErrors={targetCueErrors} />
        );

        fireEvent.mouseOver(actualNode.container.querySelector(".fa-exclamation-triangle") as Element);

        // THEN
        const sourceErrors = await actualNode.findByText((_content, node) =>
            findByTextIgnoreTags("Caption(s)", node));
        expect(sourceErrors.parentElement?.parentElement?.innerHTML).toEqual(expectedContent.container.innerHTML);
    });
    it("renders for multiple source cue errors and multiple target cue errors", async () => {
        // GIVEN
        const sourceCueErrors = [CueError.LINE_CHAR_LIMIT_EXCEEDED, CueError.LINE_COUNT_EXCEEDED];
        const targetCueErrors = [CueError.LINE_CHAR_LIMIT_EXCEEDED, CueError.LINE_COUNT_EXCEEDED];
        const expectedContent = render(
            <>
                <div className="sbte-source-cues-classNames">
                    <strong>Caption(s)</strong><br />
                    <div><span>• Max Characters Per Line Exceeded</span><br /></div>
                    <div><span>• Max Lines Per Caption Exceeded</span><br /></div>
                </div>
                <div className="sbte-target-cues-classNames">
                    <strong>Translations(s)</strong><br />
                    <div><span>• Max Characters Per Line Exceeded</span><br /></div>
                    <div><span>• Max Lines Per Caption Exceeded</span><br /></div>
                </div>
            </>
        );

        //WHEN
        const actualNode = render(
            <CueErrorsIcon cueIndex={0} sourceCuesErrors={sourceCueErrors} targetCuesErrors={targetCueErrors} />
        );

        fireEvent.mouseOver(actualNode.container.querySelector(".fa-exclamation-triangle") as Element);

        // THEN
        const sourceErrors = await actualNode.findByText((_content, node) =>
            findByTextIgnoreTags("Caption(s)", node));
        expect(sourceErrors.parentElement?.parentElement?.innerHTML).toEqual(expectedContent.container.innerHTML);
    });
});
