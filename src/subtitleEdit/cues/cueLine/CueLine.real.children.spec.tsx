import { createTestingStore } from "../../../testUtils/testingStore";
import { CueDto, Language, Track } from "../../model";
import { updateEditingTrack } from "../../trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import CueLine, { CueLineRowProps } from "./CueLine";
import { updateEditingCueIndex } from "../edit/cueEditorSlices";
import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import * as React from "react";
import { EditorState, SelectionState } from "draft-js";
import { editorStateFOR_TESTING, setEditorStateFOR_TESTING } from "../edit/CueTextEditor";


let testingStore = createTestingStore();

describe("CueLine", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    // NOTE: This test cases covers high level glossary term injection concerns of child components.
    // It is far better to test it in integration rather than state and state setters are passed to child components.
    describe("glossary term insertion", () => {
        it("inserts first glossary term into editor when clicked", () => {
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
            const sourceCue = {
                vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
                cueCategory: "DIALOGUE",
                glossaryMatches: [
                    { source: "text", replacements: ["text replacement1", "text replacement2", "repl3"]},
                    { source: "Line", replacements: ["lineReplacement1"]}
                ]
            } as CueDto;
            const targetCue = { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto;

            const matchedCue = {
                targetCues: [{ index: 0, cue: targetCue }],
                sourceCues: [{ index: 0, cue: sourceCue }]
            };

            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: [matchedCue],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={matchedCue}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelectorAll(".sbte-glossary-match")[0]);

            // THEN
            expect(actualNode.container.outerHTML).toContain("Editing Line 1lineReplacement1");
        });

        it("inserts second glossary term into editor when clicked", () => {
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
            const sourceCue = {
                vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
                cueCategory: "DIALOGUE",
                glossaryMatches: [
                    { source: "Line", replacements: ["lineReplacement1"]},
                    { source: "text", replacements: ["text replacement1", "text replacement2", "repl3"]}
                ]
            } as CueDto;
            const targetCue = { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto;

            const matchedCue = {
                targetCues: [{ index: 0, cue: targetCue }],
                sourceCues: [{ index: 0, cue: sourceCue }]
            };

            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: [matchedCue],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={matchedCue}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelectorAll(".sbte-glossary-match")[1]);

            // THEN
            expect(actualNode.container.outerHTML).toContain("Editing Line 1text replacement1/text replacement2/repl3");
        });

        it("inserts glossary term into middle of test in editor when clicked", async () => {
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
            const sourceCue = {
                vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
                cueCategory: "DIALOGUE",
                glossaryMatches: [
                    { source: "text", replacements: ["text replacement1", "text replacement2", "repl3"]},
                    { source: "Line", replacements: ["#lineReplacement1#"]}
                ]
            } as CueDto;
            const targetCue = { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto;

            const matchedCue = {
                targetCues: [{ index: 0, cue: targetCue }],
                sourceCues: [{ index: 0, cue: sourceCue }]
            };

            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: [matchedCue],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={matchedCue}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // WHEN
            // Change position of cursor in draft-js editor
            const selectionState = editorStateFOR_TESTING.getSelection();
            const newSelectionState = selectionState.set("anchorOffset", 5).set("focusOffset", 5) as SelectionState;
            setEditorStateFOR_TESTING(EditorState.forceSelection(editorStateFOR_TESTING, newSelectionState));

            fireEvent.click(actualNode.container.querySelectorAll(".sbte-glossary-match")[0]);

            // THEN
            expect(actualNode.container.outerHTML).toContain("Editi#lineReplacement1#ng Line 1");
        });
    });
});
