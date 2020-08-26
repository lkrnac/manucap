import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import React from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import { mount, ReactWrapper, shallow } from "enzyme";
import { createTestingStore } from "../../../testUtils/testingStore";
import { CueDto, Track } from "../../model";
import CueTextEditor from "./CueTextEditor";
import { updateEditingTrack } from "../../trackSlices";
import { updateCues } from "../cueSlices";
import { SpellCheck } from "../spellCheck/model";
import { Character } from "../../shortcutConstants";
import { Overlay } from "react-bootstrap";
import { setSaveTrack } from "../saveSlices";
import { setSpellCheckDomain } from "../spellCheck/spellCheckSlices";
import Select from "react-select/base";


jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback
}));
const spellCheckFakeMatches = {
    "matches": [
        {
            message: "Possible spelling mistake found.",
            replacements: [
                { value: "Context" }, { value: "Somewhat" },
                { value: "Sometime" }, { value: "Competent" },
                { value: "Pretext" }, { value: "Subtext" },
                { value: "Teletext" }, { value: "Sweetest" },
                { value: "Softest" }, { value: "Semtex" },
                { value: "Omelet" }, { value: "Somerset" },
                { value: "Soberest" }
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

const bindEnterAndEscKeysSpy = jest.fn() as () => void;


describe("CueTextEditor", () => {

    const createEditorNode = (text = "someText", spellCheckFakeMatches: SpellCheck): ReactWrapper => {
        const vttCue = new VTTCue(0, 1, text);
        const editUuid = testingStore.getState().cues[0].editUuid;
        return mount(
            <Provider store={testingStore}>
                <CueTextEditor
                    spellCheck={spellCheckFakeMatches}
                    bindEnterAndEscKeys={bindEnterAndEscKeysSpy}
                    index={0}
                    vttCue={vttCue}
                    editUuid={editUuid}
                />
            </Provider>
        );
    };

    beforeEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
        testingStore = createTestingStore();
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
    });


    // If clicked ctrl + space assert that popover is shown on error
    it("shows popover when popover show keyboard shortcut is entered", () => {
        const actualNode = createEditorNode("SomeText", spellCheckFakeMatches);
        const editor = actualNode.find(".public-DraftEditor-content");

        // WHEN
        editor.simulate("keyDown", { keyCode: Character.SPACE, metaKey: true, ctrlKey: true });

        // THEN
        expect(actualNode.find(Overlay).at(0).props().show).toBeTruthy();
    });

    // if clicked ctrl + space and popover is shown, popover should hide
    it("hides popover when enter popover show shortcut again while popover is shown already", () => {
        const actualNode = createEditorNode("SomeText", spellCheckFakeMatches);
        const editor = actualNode.find(".public-DraftEditor-content");
        editor.simulate("keyDown", { keyCode: Character.SPACE, metaKey: true, ctrlKey: true });

        // WHEN
        editor.simulate("keyDown", { keyCode: Character.SPACE, metaKey: true, ctrlKey: true });

        // THEN
        expect(actualNode.find(Overlay).at(0).props().show).toBeFalsy();
    });

    // if clicked esc and popover is shown, popover should hide
    it("hides popover when enter popover close shortcut", () => {
        //GIVEN
        const actualNode = createEditorNode("SomeText", spellCheckFakeMatches);
        const editor = actualNode.find(".public-DraftEditor-content");
        editor.simulate("keyDown", { keyCode: Character.SPACE, ctrlKey: true });

        //WHEN
        actualNode.find(Overlay).at(0).simulate("keyDown",
            { keyCode: Character.ESCAPE });

        // THEN
        expect(actualNode.find(Overlay).at(0).props().show).toBeFalsy();
    });

    // if clicked arrow down twice, 3rd option should be focused
    it("moves between options using the arrow down shortcut", () => {
        //GIVEN
        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        const actualNode = createEditorNode("SomeText", spellCheckFakeMatches);
        const editor = actualNode.find(".public-DraftEditor-content");

        editor.simulate("keyDown", { keyCode: Character.SPACE, ctrlKey: true, metaKey: true });

        //WHEN
        // Try using keydown on select
        actualNode.find(Overlay).at(0).find(Select).at(0)
            .simulate("keyDown",{ keyCode: Character.ARROW_DOWN });
        actualNode.find(Overlay).at(0).find(Select).at(0)
            .simulate("keyDown",{ keyCode: Character.ARROW_DOWN });


        actualNode.find(Overlay).at(1).find(Select).at(0)
            .simulate("keyDown",{ keyCode: Character.ARROW_DOWN });

        actualNode.find(Overlay).at(2).find(Select).at(0)
            .simulate("keyDown",{ keyCode: Character.ARROW_DOWN });


        // Try using keydown on overlay
        actualNode.find(Overlay).at(0).simulate("keyDown",{ keyCode: Character.ARROW_DOWN });

        // Try with document active element
        const event = new KeyboardEvent("keydown", { code: "ArrowDown" });
        document?.activeElement?.dispatchEvent(event);

        // try with menulist
        actualNode.find(Overlay).at(0).find(Select).at(0)
            .find(".spellcheck__menu-list").at(0).simulate("keyDown",{ keyCode: Character.ARROW_DOWN });

        // using spellcheck__control from document
        document.getElementsByClassName("spellcheck__control").item(0)?.dispatchEvent(event);
        document.getElementsByClassName("spellcheck__option").item(0)?.dispatchEvent(event);

        //THEN
        expect(document.getElementsByClassName("spellcheck__option--is-focused").length).toEqual(1);
        expect(actualNode.find(".spellcheck__option--is-focused").length).toEqual(1);


    });

    // if clicked arrow down twice, 3rd option should be focused
    it("moves between options using the arrow down shortcut2", () => {
        //GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        const actualNode = createEditorNode("SomeText", spellCheckFakeMatches);
        const editor = actualNode.find(".public-DraftEditor-content");
        editor.simulate("keyDown", { keyCode: Character.SPACE, ctrlKey: true });

        //WHEN
        // Try using keydown on select
        actualNode.find(Overlay).at(0).simulate("keyDown",{ keyCode: Character.ENTER });

        //THEN
        expect(saveTrack).toBeCalled();
    });
});
