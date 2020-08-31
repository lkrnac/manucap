/**  * @jest-environment jsdom-sixteen  */
// TODO Remove above when we update to react-scripts with Jest 26:
// https://github.com/facebook/create-react-app/pull/8362
// eslint-disable-next-line
// https://stackoverflow.com/questions/61036156/react-typescript-testing-typeerror-mutationobserver-is-not-a-constructor#comment110029314_61039444

import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import React from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { createTestingStore } from "../../../testUtils/testingStore";
import { CueDto, Track } from "../../model";
import CueTextEditor from "./CueTextEditor";
import { updateEditingTrack } from "../../trackSlices";
import { updateCues } from "../cueSlices";
import { SpellCheck } from "../spellCheck/model";
import { Character } from "../../shortcutConstants";
import { fireEvent, render } from "@testing-library/react";
import { setSaveTrack } from "../saveSlices";
//@ts-ignore
import { LodashDebounce } from "lodash/ts3.1/fp";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => {
        return callback;
    }
}));

// mock deounce.cancel
jest.mock("lodash", () => (
    {
        debounce: (fn: LodashDebounce): Function => {
            fn.cancel = jest.fn();
            return fn;
        }
    }));

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
        //GIVEN
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches));
        const editor = container.querySelector(".public-DraftEditor-content") as Element;

        //WHEN
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, ctrlKey: true, metaKey: true });


        // THEN
        expect(document.querySelector("div.popover.show")).not.toBeNull();
    });

    it("hides popover when enter popover show shortcut again while popover is shown already", () => {
        //GIVEN
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches));
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, ctrlKey: true, metaKey: true });

        //WHEN
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, ctrlKey: true, metaKey: true });

        // THEN
        expect(document.querySelector("div.popover.show")).toBeNull();
    });

    it("hides popover when enter popover close shortcut", async () => {
        //GIVEN
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches));
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, ctrlKey: true, metaKey: true });

        //WHEN
        fireEvent.keyDown(document.querySelector(".spellcheck__menu") as Element,
            { keyCode: Character.ESCAPE });

        // THEN
        expect(document.querySelector("div.popover.show")).toBeNull();
    });

    it("moves between options using the arrow up/down shortcut", () => {
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
        expect(document.querySelector(".spellcheck__option--is-focused")?.innerHTML)
            .toEqual("Sometime");
    });

    it("select an option using enter shortcut", () => {
        //GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

        const { container, unmount } = render(createEditorNode("SomeText", spellCheckFakeMatches));
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
            keyCode: Character.ENTER
        });
        unmount();

        //THEN
        expect(saveTrack).toBeCalled();
        expect(bindEnterAndEscKeysSpy).toBeCalled();
    });

    it("calls bindEnterAndEscKeys when closing the popover", () => {
        //GIVEN
        const { container, unmount } = render(createEditorNode("SomeText", spellCheckFakeMatches));
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, ctrlKey: true, metaKey: true });


        //WHEN
        fireEvent.keyDown(document.querySelector(".spellcheck__menu") as Element,
            { keyCode: Character.ESCAPE });
        unmount();

        //THEN
        expect(bindEnterAndEscKeysSpy).toBeCalled();
    });


    it("do nothing when type enter and escape on editor while popover is shown", () => {
        //GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches));
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, {
            keyCode: Character.SPACE, ctrlKey: true, metaKey: true
        });

        //WHEN
        fireEvent.keyDown(editor, {
            keyCode: Character.ENTER
        });

        //THEN
        expect(saveTrack).not.toBeCalled();
        expect(document.querySelector("div.popover.show")).not.toBeNull();
    });

    it("does not select an option if clicked ctrl space on the dropdown", () => {
        //GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches));
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, {
            keyCode: Character.SPACE, ctrlKey: true, metaKey: true
        });
        fireEvent.keyDown(document.querySelector(".spellcheck__menu") as Element, {
            keyCode: Character.ARROW_DOWN,
            key: "ArrowDown",
        });

        //WHEN
        fireEvent.keyDown(document.querySelector(".spellcheck__option--is-focused") as Element, {
            keyCode: Character.SPACE, ctrlKey: true, metaKey: true
        });

        //THEN
        expect(saveTrack).not.toBeCalled();
        expect(document.querySelector("div.popover.show")).toBeNull();
    });

    it("handle popover keyboard shortcut if it was passed to editor", () => {
        //GIVEN
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches));
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, ctrlKey: true, metaKey: true });

        //WHEN
        fireEvent.keyDown(editor as Element, { keyCode: Character.ESCAPE });

        // THEN
        expect(document.querySelector("div.popover.show")).not.toBeNull();
    });

});
