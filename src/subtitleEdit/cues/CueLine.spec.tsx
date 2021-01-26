import "../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import React, { ReactElement } from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";

import { CueDto, Language, Track } from "../model";
import CueEdit from "./edit/CueEdit";
import CueLine, { CueLineRowProps } from "./CueLine";
import CueView, { CueViewProps } from "./view/CueView";
import { removeDraftJsDynamicValues } from "../../testUtils/testUtils";
import { createTestingStore } from "../../testUtils/testingStore";
import CueLineFlap from "./CueLineFlap";
import { updateEditingCueIndex } from "./edit/cueEditorSlices";
import { updateEditingTrack } from "../trackSlices";
import "./edit/CueTextEditor";

jest.mock("./edit/CueTextEditor", () => (): ReactElement => <div>CueTextEditor</div>);
jest.mock("./view/CueView", () => (props: CueViewProps): ReactElement => <div>CueView: {JSON.stringify(props)}</div>);

let testingStore = createTestingStore();

const targetCues = [
    { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(2, 3, "Editing Line 3"), cueCategory: "DIALOGUE" } as CueDto
];

const targetCuesWithIndexes = [
    { index: 0, cue: targetCues[0] },
    { index: 1, cue: targetCues[1] },
    { index: 2, cue: targetCues[2] }
];

const sourceCues = [
    { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" } as CueDto,
];

const sourceCuesWithIndexes = [
    { index: 0, cue: sourceCues[0] },
    { index: 1, cue: sourceCues[1] },
    { index: 2, cue: sourceCues[2] }
];

describe("CueLine", () => {
    beforeEach(() => { testingStore = createTestingStore(); });
    it("renders edit line in captioning mode", () => {
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

        const expectedNode = render(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <CueLineFlap rowIndex={0} cue={targetCuesWithIndexes[0]} />
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueEdit index={0} cue={targetCues[0]} playerTime={0} />
                    </div>
                </div>
            </Provider>
        );
        const cueWithSource = { targetCues: [targetCuesWithIndexes[0]]};
        const cueLineRowProps = { playerTime: 0, withoutSourceCues: true } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={0}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
            .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
    });

    it("renders view line in captioning mode", () => {
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
        const expectedNode = render(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <CueLineFlap rowIndex={0} cue={targetCuesWithIndexes[0]} />
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            targetCueIndex={0}
                            cue={targetCuesWithIndexes[0].cue}
                            targetCuesLength={1}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            showActionsPanel
                            languageDirection="RTL"
                        />
                    </div>
                </div>
            </Provider>
        );
        const cueWithSource = { targetCues: [targetCuesWithIndexes[0]]};
        const cueLineRowProps = { playerTime: 0, withoutSourceCues: true, cuesLength: 1 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={0}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders edit line in translation mode", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            sourceLanguage: { id: "en-US", name: "English", direction: "LTR" } as Language,
            language: { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language,
            default: true,
            mediaTitle: "Sample Polish",
            mediaLength: 4000,
            progress: 50
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const expectedNode = render(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <CueLineFlap rowIndex={0} cue={targetCuesWithIndexes[0]} />
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            targetCueIndex={0}
                            cue={sourceCues[0]}
                            targetCuesLength={1}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms
                            languageDirection="LTR"
                        />
                        <CueEdit index={0} cue={targetCues[0]} playerTime={0} />
                    </div>
                </div>
            </Provider>
        );
        const cueWithSource = { targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]};
        const cueLineRowProps = { playerTime: 0, withoutSourceCues: false, cuesLength: 1 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={0}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
            .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
    });

    it("renders view line in translation mode", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            sourceLanguage: { id: "en-US", name: "English", direction: "LTR" } as Language,
            language: { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language,
            default: true,
            mediaTitle: "Sample Polish",
            mediaLength: 4000,
            progress: 50
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const expectedNode = render(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <CueLineFlap rowIndex={0} cue={targetCuesWithIndexes[0]} />
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            targetCueIndex={0}
                            cue={sourceCues[0]}
                            targetCuesLength={1}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            languageDirection="LTR"
                        />
                        <CueView
                            targetCueIndex={0}
                            cue={targetCues[0]}
                            targetCuesLength={1}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            showActionsPanel
                            languageDirection="RTL"
                        />
                    </div>
                </div>
            </Provider>
        );
        const cueWithSource = { targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]};
        const cueLineRowProps = { playerTime: 0, withoutSourceCues: false, cuesLength: 1 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={0}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders view + translation without target", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <CueLineFlap rowIndex={0} />
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            cue={sourceCues[0]}
                            targetCuesLength={0}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                        />
                        <CueView
                            cue={sourceCues[0]}
                            targetCuesLength={0}
                            playerTime={0}
                            hideText
                            className="sbte-gray-200-background"
                            showGlossaryTerms={false}
                            showActionsPanel
                        />
                    </div>
                </div>
            </Provider>
        );
        const cueWithSource = { sourceCues: [sourceCuesWithIndexes[0]]};
        const cueLineRowProps = { playerTime: 0, withoutSourceCues: false, cuesLength: 0 } as CueLineRowProps;

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={0}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders view + translation without source", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            sourceLanguage: { id: "en-US", name: "English", direction: "LTR" } as Language,
            language: { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language,
            default: true,
            mediaTitle: "Sample Polish",
            mediaLength: 4000,
            progress: 50
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const expectedNode = render(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <CueLineFlap rowIndex={0} cue={targetCuesWithIndexes[0]} />
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            targetCueIndex={0}
                            cue={targetCues[0]}
                            targetCuesLength={1}
                            playerTime={0}
                            hideText
                            className="sbte-gray-200-background"
                            showGlossaryTerms={false}
                            languageDirection="RTL"
                        />
                        <CueView
                            targetCueIndex={0}
                            cue={targetCues[0]}
                            targetCuesLength={1}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            showActionsPanel
                            languageDirection="RTL"
                        />
                    </div>
                </div>
            </Provider>
        );
        const cueWithSource = { targetCues: [targetCuesWithIndexes[0]], sourceCues: []};
        const cueLineRowProps = { playerTime: 0, withoutSourceCues: false, cuesLength: 1 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={0}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders translation view line with 3 target cues", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            sourceLanguage: { id: "en-US", name: "English", direction: "LTR" } as Language,
            language: { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language,
            default: true,
            mediaTitle: "Sample Polish",
            mediaLength: 4000,
            progress: 50
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const expectedNode = render(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <CueLineFlap rowIndex={0} cue={targetCuesWithIndexes[0]} />
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            targetCueIndex={0}
                            cue={sourceCues[0]}
                            targetCuesLength={3}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            languageDirection="LTR"
                        />
                        <div className="sbte-cue-divider-good" />
                        <CueView
                            targetCueIndex={0}
                            cue={targetCues[0]}
                            targetCuesLength={3}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            showActionsPanel
                            languageDirection="RTL"
                        />
                        <CueView
                            targetCueIndex={1}
                            cue={targetCues[1]}
                            targetCuesLength={3}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            showActionsPanel
                            languageDirection="RTL"
                        />
                        <CueView
                            targetCueIndex={2}
                            cue={targetCues[2]}
                            targetCuesLength={3}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            showActionsPanel
                            languageDirection="RTL"
                        />
                    </div>
                </div>
            </Provider>
        );
        const cueWithSource = { targetCues: targetCuesWithIndexes, sourceCues: [sourceCuesWithIndexes[0]]};
        const cueLineRowProps = { playerTime: 0, withoutSourceCues: false, cuesLength: 3 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={0}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders translation edit line with 3 source cues", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            sourceLanguage: { id: "en-US", name: "English", direction: "LTR" } as Language,
            language: { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language,
            default: true,
            mediaTitle: "Sample Polish",
            mediaLength: 4000,
            progress: 50
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const expectedNode = render(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <CueLineFlap rowIndex={0} cue={targetCuesWithIndexes[0]} />
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            targetCueIndex={0}
                            cue={sourceCues[0]}
                            targetCuesLength={3}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            languageDirection="LTR"
                        />
                        <div className="sbte-cue-divider-good" />
                        <CueView
                            targetCueIndex={0}
                            cue={targetCues[0]}
                            targetCuesLength={3}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            showActionsPanel
                            languageDirection="RTL"
                        />
                        <CueEdit index={1} cue={targetCues[1]} playerTime={0} />
                        <CueView
                            targetCueIndex={2}
                            cue={targetCues[2]}
                            targetCuesLength={3}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            showActionsPanel
                            languageDirection="RTL"
                        />
                    </div>
                </div>
            </Provider>
        );
        const cueWithSource = { targetCues: targetCuesWithIndexes, sourceCues: [sourceCuesWithIndexes[0]]};
        const cueLineRowProps = { playerTime: 0, withoutSourceCues: false, cuesLength: 3 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={0}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders translation view line with 3 source cues", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            sourceLanguage: { id: "en-US", name: "English", direction: "LTR" } as Language,
            language: { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language,
            default: true,
            mediaTitle: "Sample Polish",
            mediaLength: 4000,
            progress: 50
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const expectedNode = render(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <CueLineFlap rowIndex={0} cue={targetCuesWithIndexes[0]} />
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            targetCueIndex={0}
                            cue={sourceCues[0]}
                            targetCuesLength={1}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            languageDirection="LTR"
                        />
                        <CueView
                            targetCueIndex={0}
                            cue={sourceCues[1]}
                            targetCuesLength={1}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            languageDirection="LTR"
                        />
                        <CueView
                            targetCueIndex={0}
                            cue={sourceCues[2]}
                            targetCuesLength={1}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            languageDirection="LTR"
                        />
                        <div className="sbte-cue-divider-good" />
                        <CueView
                            targetCueIndex={0}
                            cue={targetCues[0]}
                            targetCuesLength={1}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            showActionsPanel
                            languageDirection="RTL"
                        />
                    </div>
                </div>
            </Provider>
        );
        const cueWithSource = { targetCues: [targetCuesWithIndexes[0]], sourceCues: sourceCuesWithIndexes };
        const cueLineRowProps = { playerTime: 0, withoutSourceCues: false, cuesLength: 1 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={0}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders translation edit line with 3 target cues", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            sourceLanguage: { id: "en-US", name: "English", direction: "LTR" } as Language,
            language: { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language,
            default: true,
            mediaTitle: "Sample Polish",
            mediaLength: 4000,
            progress: 50
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const expectedNode = render(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <CueLineFlap rowIndex={0} cue={targetCuesWithIndexes[0]} />
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            targetCueIndex={0}
                            cue={sourceCues[0]}
                            targetCuesLength={3}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            languageDirection="LTR"
                        />
                        <div className="sbte-cue-divider-good" />
                        <CueView
                            targetCueIndex={0}
                            cue={targetCues[0]}
                            targetCuesLength={3}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            showActionsPanel
                            languageDirection="RTL"
                        />
                        <CueEdit index={1} cue={targetCues[1]} playerTime={0} />
                        <CueView
                            targetCueIndex={2}
                            cue={targetCues[2]}
                            targetCuesLength={3}
                            playerTime={0}
                            className="sbte-gray-100-background"
                            showGlossaryTerms={false}
                            showActionsPanel
                            languageDirection="RTL"
                        />
                    </div>
                </div>
            </Provider>
        );
        const cueWithSource = { targetCues: targetCuesWithIndexes, sourceCues: [sourceCuesWithIndexes[0]]};
        const cueLineRowProps = { playerTime: 0, withoutSourceCues: false, cuesLength: 3 } as CueLineRowProps;

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={0}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={React.createRef()}
                    onClick={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("configures rowReference to root container HTML element", () => {
        // GIVEN
        const cueWithSource = { targetCues: [targetCuesWithIndexes[1]]};
        const cueLineRowProps = { playerTime: 0, withoutSourceCues: true } as CueLineRowProps;
        const rowRef = React.createRef() as React.RefObject<HTMLDivElement>;

        // WHEN
        const actualNode = render(
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
        const refNode = rowRef.current as HTMLDivElement;
        expect(refNode.outerHTML).toEqual(actualNode.container.innerHTML);
    });
});
