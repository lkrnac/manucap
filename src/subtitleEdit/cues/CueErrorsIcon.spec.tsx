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
import { Provider } from "react-redux";
import testingStore from "../../testUtils/testingStore";

describe("CueErrorsIcon", () => {

    it("renders for single cue error", async () => {
        // GIVEN
        const cueError = [CueError.LINE_CHAR_LIMIT_EXCEEDED];
        const expectedContent = render(
            <div className="sbte-cues-errors">
                <strong>Cue errors</strong><br />
                <div><span>• Max Characters Per Line Exceeded</span><br /></div>
            </div>
        );

        //WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueErrorsIcon cueIndex={0} cuesErrors={cueError} showErrors={false} />
            </Provider>
        );

        fireEvent.mouseOver(actualNode.container.querySelector(".fa-exclamation-triangle") as Element);

        // THEN
        const cueErrorsContent = await actualNode.findByText((_content, node) =>
            findByTextIgnoreTags("Cue errors", node));
        expect(cueErrorsContent.parentElement?.outerHTML).toEqual(expectedContent.container.innerHTML);
    });

    it("renders for multiple cue errors", async () => {
        // GIVEN
        const cueErrors = [
            CueError.LINE_CHAR_LIMIT_EXCEEDED,
            CueError.LINE_COUNT_EXCEEDED,
            CueError.TIME_GAP_OVERLAP
        ];
        const expectedContent = render(
            <div className="sbte-cues-errors">
                <strong>Cue errors</strong><br />
                <div><span>• Max Characters Per Line Exceeded</span><br /></div>
                <div><span>• Max Lines Per Caption Exceeded</span><br /></div>
                <div><span>• Cue Overlap</span><br /></div>
            </div>
        );

        //WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueErrorsIcon cueIndex={0} cuesErrors={cueErrors} showErrors={false} />
            </Provider>
        );

        fireEvent.mouseOver(actualNode.container.querySelector(".fa-exclamation-triangle") as Element);

        // THEN
        const cueErrorsContent = await actualNode.findByText((_content, node) =>
            findByTextIgnoreTags("Cue errors", node));
        expect(cueErrorsContent.parentElement?.outerHTML).toEqual(expectedContent.container.innerHTML);
    });
});
