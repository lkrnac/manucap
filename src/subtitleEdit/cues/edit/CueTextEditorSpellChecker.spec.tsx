/**  * @jest-environment jsdom-sixteen  */
import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import React from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import { mount } from "enzyme";
import { createTestingStore } from "../../../testUtils/testingStore";
import { CueDto, Track } from "../../model";
import CueTextEditor from "./CueTextEditor";
import { updateEditingTrack } from "../../trackSlices";
import { updateCues } from "../cueSlices";
import { SpellCheck } from "../spellCheck/model";
import { Character } from "../../shortcutConstants";
import { Overlay } from "react-bootstrap";
import { fireEvent, render } from "@testing-library/react";
import { setSaveTrack } from "../saveSlices";
import { setSpellCheckDomain } from "../spellCheck/spellCheckSlices";
import { act } from "react-dom/test-utils";


const debounceMock = jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback
}));
//@ts-ignore since we are mocking the debounce function
jest.mock(debounceMock.cancel);

const spellCheckFakeMatches = {
    "matches": [
        {
            message: "Possible spelling mistake found.",
            replacements: [
                { value: "Context" },
                { value: "Somewhat" },
                { value: "Sometime" },
                { value: "Competent" },
            ],
            offset: 0,
            length: 8
        }
    ]
} as SpellCheck;

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
} as Track;

const testingCues = [
    { vttCue: new VTTCue(0, 1.225, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1.225, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

let testingStore = createTestingStore();
let bindEnterAndEscKeysSpy = jest.fn();

describe("CueTextEditor.SpellChecker keyboard shortcut", () => {
    beforeEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
        bindEnterAndEscKeysSpy = jest.fn();
        testingStore = createTestingStore();
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
    });

    const createEditorNode = (text = "someText", spellCheckFakeMatches: SpellCheck): React.ReactElement => {
        const vttCue = new VTTCue(0, 1, text);
        const editUuid = testingStore.getState().cues[0].editUuid;
        return (
            <Provider store={testingStore}>
                <CueTextEditor
                    spellCheck={spellCheckFakeMatches}
                    bindCueViewModeKeyboardShortcut={bindEnterAndEscKeysSpy}
                    index={0}
                    vttCue={vttCue}
                    editUuid={editUuid}
                />
            </Provider>);
    };

    it("shows popover when popover show keyboard shortcut is entered", () => {
        const actualNode = mount(createEditorNode("SomeText", spellCheckFakeMatches));
        const editor = actualNode.find(".public-DraftEditor-content");

        // WHEN
        editor.simulate("keyDown", { keyCode: Character.SPACE, metaKey: true, ctrlKey: true });

        // THEN
        expect(actualNode.find(Overlay).at(0).props().show).toBeTruthy();
    });

    it("hides popover when enter popover show shortcut again while popover is shown already", () => {
        const actualNode = mount(createEditorNode("SomeText", spellCheckFakeMatches));
        const editor = actualNode.find(".public-DraftEditor-content");
        editor.simulate("keyDown", { keyCode: Character.SPACE, metaKey: true, ctrlKey: true });

        // WHEN
        editor.simulate("keyDown", { keyCode: Character.SPACE, metaKey: true, ctrlKey: true });

        // THEN
        expect(actualNode.find(Overlay).at(0).props().show).toBeFalsy();
    });

    it("hides popover when enter popover close shortcut", async () => {
        //GIVEN
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches));
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        await act(async () => {
            fireEvent.keyDown(editor, { keyCode: Character.SPACE, ctrlKey: true, metaKey: true });
        });
        //WHEN
        fireEvent.keyDown(document.querySelector("div.popover") as Element,
            { keyCode: Character.ESCAPE });

        // THEN
        expect(document.querySelector("div.popover.show")).toBeNull();
    });

    it("moves between options using the arrow up/down shortcut", async () => {
        //GIVEN
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches));
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, ctrlKey: true, metaKey: true });

        //WHEN
        for (let i = 0; i < 5; i++) {
            fireEvent.keyDown(document.querySelector(".spellcheck__menu") as Element, {
                keyCode: 40,
                key: "ArrowDown",
            });
        }
        for (let i = 0; i < 2; i++) {
            fireEvent.keyDown(document.querySelector(".spellcheck__menu") as Element, {
                keyCode: 38,
                key: "ArrowUp",
            });
        }

        //THEN
        expect(document.querySelector(".spellcheck__option--is-focused")?.innerHTML).toEqual("Sometime");
    });

    it("moves between options using enter shortcut", async () => {
        //GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);

        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches));
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, {
            keyCode: Character.SPACE, ctrlKey: true, metaKey: true
        });

        //WHEN
        for (let i = 0; i < 2; i++) {
            fireEvent.keyDown(document.querySelector(".spellcheck__menu") as Element, {
                keyCode: Character.ARROW_DOWN,
                key: "ArrowDown",
            });
        }
        fireEvent.keyDown(document.querySelector(".spellcheck__option--is-focused") as Element, {
            keyCode: Character.ENTER,
            key: "Enter",
        });

        //THEN
        expect(saveTrack).toBeCalled;
        expect(bindEnterAndEscKeysSpy).toBeCalled;
    });

    it("calls bindEnterAndEscKeys when closing the popover", async () => {
        //GIVEN
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches));
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, ctrlKey: true, metaKey: true });


        //WHEN
        fireEvent.keyDown(document.querySelector("div.popover") as Element,
            { keyCode: Character.ESCAPE });

        // THEN
        expect(bindEnterAndEscKeysSpy).toBeCalled;
    });
});
