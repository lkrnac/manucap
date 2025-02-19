import "../../../testUtils/initBrowserEnvironment";

import "video.js"; // VTTCue definition
import { ReactElement } from "react";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";

import { createTestingStore } from "../../../testUtils/testingStore";
import {
    MockedDebouncedFunction,
    removeDraftJsDynamicValues
} from "../../../testUtils/testUtils";
import { CueDto, Track } from "../../model";
import { updateCues } from "../cuesList/cuesListActions";
import CueTextEditor, { CueTextEditorProps } from "./CueTextEditor";
import { updateEditingTrack } from "../../trackSlices";
import { fetchSpellCheck } from "../spellCheck/spellCheckFetch";
import { Replacement, SpellCheck } from "../spellCheck/model";
import { act } from "react-dom/test-utils";
import { setSpellCheckDomain } from "../../spellcheckerSettingsSlice";
import { saveCueUpdateSlice } from "../saveCueUpdateSlices";

jest.mock("lodash", () => ({
    debounce: (fn: MockedDebouncedFunction): Function => {
        fn.cancel = jest.fn();
        return fn;
    },
    get: jest.requireActual("lodash/get"),
    findIndex: jest.requireActual("lodash/findIndex"),
    findLastIndex: jest.requireActual("lodash/findLastIndex"),
    sortBy: jest.requireActual("lodash/sortBy")
}));
jest.mock("../spellCheck/spellCheckFetch");
// @ts-ignore we are mocking this function
fetchSpellCheck.mockImplementation(() => jest.fn());

let testingStore = createTestingStore();

const cues = [
    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { id: "cue-2", vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

interface ReduxTestWrapperProps {
    store: Store;
    props: CueTextEditorProps;
}
const bindCueViewModeKeyboardShortcutSpy = jest.fn() as () => void;
const unbindCueViewModeKeyboardShortcutSpy = jest.fn() as () => void;
const ruleId = "MORFOLOGIK_RULE_EN_US";

const ReduxTestWrapper = (props: ReduxTestWrapperProps): ReactElement => (
    <Provider store={props.store}>
        <CueTextEditor
            bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
            unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
            index={props.props.index}
            vttCue={props.props.vttCue}
            editUuid={props.props.editUuid}
            spellCheck={props.props.spellCheck}
            setGlossaryTerm={jest.fn()}
            autoFocus
        />
    </Provider>
);

const testTrack = { mediaTitle: "testingTrack", language: { id: "en-US", name: "English", direction: "LTR" }};

const updateCueMock = jest.fn();

describe("CueTextEditor", () => {
    beforeEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
        testingStore = createTestingStore();
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
        testingStore.dispatch(saveCueUpdateSlice.actions.setUpdateCueCallback(updateCueMock));
        jest.resetAllMocks();
    });

    it("doesn't re-render decorators during composition mode for diacritics", async () => {
        // GIVEN
        const spellCheck = {
            matches: [
                { offset: 0, length: 2, replacements: [] as Replacement[],
                    context: { text: "any", length: 2, offset: 0 },
                    rule: { id: ruleId }},
            ]
        } as SpellCheck;
        const vttCue = new VTTCue(0, 1, "ddd");
        const editUuid = testingStore.getState().cues[0].editUuid;
        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
        // @ts-ignore we are mocking this function
        fetchSpellCheck.mockImplementationOnce(() => Promise.resolve({}));
        const expectedContent = "<span class=\"mc-text-with-error\" " +
            "aria-controls=\"spellcheckIssue-undefined-0-2\" aria-haspopup=\"true\"><span data-offset-key=\"\">" +
            "<span data-text=\"true\">dd</span></span></span>" +
            "<span data-offset-key=\"\"><span data-text=\"true\">d</span></span>";

        // WHEN
        // let actualNode: HTMLDivElement;
        // await act(async () => {
        const actualNode = render(
                <ReduxTestWrapper
                    store={testingStore}
                    props={
                        {
                            index: 0,
                            vttCue,
                            autoFocus: true,
                            editUuid,
                            spellCheck,
                            bindCueViewModeKeyboardShortcut: bindCueViewModeKeyboardShortcutSpy,
                            unbindCueViewModeKeyboardShortcut: unbindCueViewModeKeyboardShortcutSpy,
                            setGlossaryTerm: jest.fn()
                        }
                    }
                />);
        // });

        // THEN
        let actual = removeDraftJsDynamicValues(actualNode.container.outerHTML);
        expect(actual).toContain(expectedContent);

        // WHEN
        const editor = actualNode.container.querySelector(".public-DraftEditor-content");
        fireEvent.compositionStart(editor!);
        actualNode.container.querySelectorAll("span[data-text='true']")
            .item(1).appendChild(document.createTextNode("â"));

        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
        // @ts-ignore we are mocking this function
        fetchSpellCheck.mockImplementationOnce(() => Promise.resolve({}));
        const newSpellCheck = {
            matches: [
                { offset: 0, length: 3, replacements: [] as Replacement[],
                    context: { text: "any", length: 3, offset: 0 },
                    rule: { id: ruleId }},
            ]
        } as SpellCheck;
        actualNode.rerender(
            <ReduxTestWrapper
                store={testingStore}
                props={
                    {
                        index: 0,
                        vttCue,
                        autoFocus: true,
                        editUuid,
                        spellCheck: newSpellCheck,
                        bindCueViewModeKeyboardShortcut: bindCueViewModeKeyboardShortcutSpy,
                        unbindCueViewModeKeyboardShortcut: unbindCueViewModeKeyboardShortcutSpy,
                        setGlossaryTerm: jest.fn()
                    }
                }
            />
        );

        await act(async () => new Promise(resolve => setTimeout(resolve, 500)));

        // THEN
        const expectedCompContent = "<span class=\"mc-text-with-error\" " +
            "aria-controls=\"spellcheckIssue-undefined-0-2\" aria-haspopup=\"true\"><span data-offset-key=\"\">" +
            "<span data-text=\"true\">dd</span></span></span>" +
            "<span data-offset-key=\"\"><span data-text=\"true\">dâ</span></span>";

        actual = removeDraftJsDynamicValues(actualNode.container.outerHTML);
        expect(actual).toContain(expectedCompContent);

        // WHEN
        fireEvent.compositionEnd(editor!);
        await act(async () => new Promise(resolve => setTimeout(resolve, 600)));

        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
        // @ts-ignore we are mocking this function
        fetchSpellCheck.mockImplementationOnce(() => Promise.resolve({}));

        const afterCompSpellCheck = {
            matches: [
                { offset: 0, length: 4, replacements: [] as Replacement[],
                    context: { text: "any", length: 4, offset: 0 },
                    rule: { id: ruleId }},
            ]
        } as SpellCheck;
        actualNode.rerender(
            <ReduxTestWrapper
                store={testingStore}
                props={
                    {
                        index: 0,
                        vttCue,
                        autoFocus: true,
                        editUuid,
                        spellCheck: afterCompSpellCheck,
                        bindCueViewModeKeyboardShortcut: bindCueViewModeKeyboardShortcutSpy,
                        unbindCueViewModeKeyboardShortcut: unbindCueViewModeKeyboardShortcutSpy,
                        setGlossaryTerm: jest.fn()
                    }
                }
            />
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 500)));

        // THEN
        const expectedContentAfterComp = "<span class=\"mc-text-with-error\" " +
            "aria-controls=\"spellcheckIssue-undefined-0-4\" aria-haspopup=\"true\">" +
            "<span data-offset-key=\"\"><span data-text=\"true\">dddâ</span></span></span>";
        expect(removeDraftJsDynamicValues(actualNode.container.outerHTML)).toContain(expectedContentAfterComp);
    });
});
