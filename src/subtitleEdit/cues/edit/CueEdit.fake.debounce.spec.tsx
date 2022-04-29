import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { AnyAction } from "redux";
import { fireEvent, render } from "@testing-library/react";
import { act } from "react-dom/test-utils";

import { Character } from "../../utils/shortcutConstants";
import { CueDto, Language, Track } from "../../model";
import CueEdit from "./CueEdit";
import CueTextEditor from "./CueTextEditor";
import { Position } from "../cueUtils";
import PositionButton from "./PositionButton";
import { createTestingStore } from "../../../testUtils/testingStore";
import {
    MockedDebouncedFunction,
    removeDraftJsDynamicValues
} from "../../../testUtils/testUtils";
import { updateCues } from "../cuesList/cuesListActions";
import { SubtitleSpecification } from "../../toolbox/model";
import { readSubtitleSpecification } from "../../toolbox/subtitleSpecifications/subtitleSpecificationSlice";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { Replacement, SpellCheck } from "../spellCheck/model";
import { SearchReplaceMatches } from "../searchReplace/model";
import { fetchSpellCheck } from "../spellCheck/spellCheckFetch";
import { setSpellCheckDomain } from "../../spellcheckerSettingsSlice";
import { updateSourceCues } from "../view/sourceCueSlices";
import { updateEditingCueIndex } from "./cueEditorSlices";
import { CueActionsPanel } from "../cueLine/CueActionsPanel";
import { setCurrentPlayerTime } from "../cuesList/cuesListScrollSlice";

jest.mock("lodash", () => (
    {
        debounce: (fn: MockedDebouncedFunction): Function => {
            fn.cancel = jest.fn();
            return fn;
        },
        get: jest.requireActual("lodash/get")
    }));
jest.mock("../spellCheck/spellCheckFetch");
// @ts-ignore we are mocking this function
fetchSpellCheck.mockImplementation(() => jest.fn());

let testingStore = createTestingStore();

const cues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

const testTrack = { mediaTitle: "testingTrack", language: { id: "en-US", name: "English", direction: "LTR" }};
const testTranslationTrack = {
    type: "TRANSLATION",
    language: { id: "fr-FR", name: "French (France)" } as Language,
    sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
    timecodesUnlocked: false
} as Track;

describe("CueEdit", () => {
    beforeEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
        testingStore = createTestingStore();
        const testingSubtitleSpecification = {
            minCaptionDurationInMillis: 500,
            maxCaptionDurationInMillis: 960000,
            maxLinesPerCaption: 2,
            maxCharactersPerLine: 30,
            enabled: true
        } as SubtitleSpecification;
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
        testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
    });

    describe("major use cases", () => {

        it("renders for caption task", () => {
            // GIVEN
            // noinspection HtmlUnknownAttribute
            const expectedNode = mount(
                <Provider store={testingStore}>
                    <div
                        style={{ display: "flex" }}
                        className="tw-border-b tw-border-blue-light/20 tw-bg-white tw-z-10"
                    >
                        <div
                            style={{
                                flex: "1 0 280px",
                                width: 280,
                                display: "flex",
                                flexDirection: "column",
                                padding: "5px 10px",
                                justifyContent: "space-between"
                            }}
                        >
                            <div style={{
                                display: "flex",
                                flexDirection:"column",
                                paddingBottom: "15px"
                            }}
                            >
                                <div className="tw-space-y-1 tw-w-[140px]">
                                    <input
                                        type="text"
                                        // @ts-ignore custom attribute added by react-advanced-timefield
                                        colon=":"
                                        className="tw-form-control mousetrap tw-block tw-w-[140px] tw-text-center"
                                        value="00:00:00.000"
                                        onChange={(): void => undefined}
                                    />
                                    <input
                                        type="text"
                                        // @ts-ignore custom attribute added by react-advanced-timefield
                                        colon=":"
                                        className="tw-form-control mousetrap tw-block tw-w-[140px] tw-text-center"
                                        value="00:00:02.000"
                                        onChange={(): void => undefined}
                                    />
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }} >
                                <button
                                    className="tw-dropdown-toggle tw-btn tw-btn-light"
                                    aria-controls="cueCategoryMenu"
                                    aria-haspopup
                                >
                                    Dialogue
                                </button>
                                <button
                                    className="tw-select-none tw-flex tw-items-center tw-justify-center
                                        tw-dropdown-toggle tw-btn tw-btn-light tw-w-[68px]"
                                    aria-controls="positionButtonMenu"
                                    aria-haspopup
                                >
                                    <span>↓↓</span><span className="caret" />
                                </button>
                            </div>
                        </div>
                        <div
                            className="tw-border-l tw-border-blue-light/20 tw-flex tw-items-center"
                            style={{ flex: "1 0 calc(100% - 280px)" }}
                        >
                            <CueTextEditor
                                key={1}
                                index={0}
                                vttCue={cues[0].vttCue}
                                bindCueViewModeKeyboardShortcut={jest.fn()}
                                unbindCueViewModeKeyboardShortcut={jest.fn()}
                                setGlossaryTerm={jest.fn()}
                            />
                            <CueActionsPanel index={0} cue={cues[0]} isEdit sourceCueIndexes={[]} />
                        </div>
                    </div>
                </Provider>
            );
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit
                        index={0}
                        cue={{ vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto}
                        setGlossaryTerm={jest.fn()}
                    />
                </Provider>
            );

            // THEN
            const actual = removeDraftJsDynamicValues(actualNode.html());
            const expected = removeDraftJsDynamicValues(expectedNode.html());
            expect(actual).toEqual(expected);
        });

        it("renders for caption task", () => {
            // GIVEN
            // noinspection HtmlUnknownAttribute
            const expectedNode = mount(
                <Provider store={testingStore}>
                    <div
                        style={{ display: "flex" }}
                        className="tw-border-b tw-border-blue-light/20 tw-bg-white tw-z-10"
                    >
                        <div
                            style={{
                                flex: "1 0 280px",
                                width: 280,
                                display: "flex",
                                flexDirection: "column",
                                padding: "5px 10px",
                                justifyContent: "space-between"
                            }}
                        >
                            <div style={{
                                display: "flex",
                                flexDirection:"column",
                                paddingBottom: "15px"
                            }}
                            >
                                <div className="tw-space-y-1 tw-w-[140px]">
                                    <input
                                        type="text"
                                        // @ts-ignore custom attribute added by react-advanced-timefield
                                        colon=":"
                                        className="tw-form-control mousetrap tw-block tw-w-[140px] tw-text-center"
                                        value="00:00:00.000"
                                        onChange={(): void => undefined}
                                    />
                                    <input
                                        type="text"
                                        // @ts-ignore custom attribute added by react-advanced-timefield
                                        colon=":"
                                        className="tw-form-control mousetrap tw-block tw-w-[140px] tw-text-center"
                                        value="00:00:02.000"
                                        onChange={(): void => undefined}
                                    />
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }} >
                                <button
                                    className="tw-dropdown-toggle tw-btn tw-btn-light"
                                    aria-controls="cueCategoryMenu"
                                    aria-haspopup
                                >
                                    Dialogue
                                </button>
                                <button
                                    className="tw-select-none tw-flex tw-items-center tw-justify-center
                                        tw-dropdown-toggle tw-btn tw-btn-light tw-w-[68px]"
                                    aria-controls="positionButtonMenu"
                                    aria-haspopup
                                >
                                    <span>↓↓</span><span className="caret" />
                                </button>
                            </div>
                        </div>
                        <div
                            className="tw-border-l tw-border-blue-light/20 tw-flex tw-items-center"
                            style={{ flex: "1 0 calc(100% - 280px)" }}
                        >
                            <CueTextEditor
                                key={1}
                                index={0}
                                vttCue={cues[0].vttCue}
                                bindCueViewModeKeyboardShortcut={jest.fn()}
                                unbindCueViewModeKeyboardShortcut={jest.fn()}
                                setGlossaryTerm={jest.fn()}
                            />
                            <CueActionsPanel index={0} cue={cues[0]} isEdit sourceCueIndexes={[]} />
                        </div>
                    </div>
                </Provider>
            );
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit
                        index={0}
                        cue={{ vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto}
                        setGlossaryTerm={jest.fn()}
                    />
                </Provider>
            );

            // THEN
            const actual = removeDraftJsDynamicValues(actualNode.html());
            const expected = removeDraftJsDynamicValues(expectedNode.html());
            expect(actual).toEqual(expected);
        });

        it("renders for translation task", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testTranslationTrack as Track) as {} as AnyAction);
            const expectedNode = mount(
                <Provider store={testingStore}>
                    <div
                        style={{ display: "flex" }}
                        className="tw-border-b tw-border-blue-light/20 tw-bg-white tw-z-10"
                    >
                        <div
                            style={{
                                flex: "1 0 280px",
                                width: 280,
                                display: "flex",
                                flexDirection: "column",
                                padding: "5px 10px",
                                justifyContent: "space-between"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection:"column",
                                    paddingBottom: "15px"
                                }}
                            >
                                <div className="tw-space-y-1 tw-w-[140px]">
                                    <div
                                        id="cueEditLine-0-startTime"
                                        className="tw-form-control tw-text-center disabled"
                                        data-pr-tooltip="Timecodes are locked"
                                        data-pr-position="right"
                                        data-pr-at="right top+18"
                                    >
                                        00:00:00.000
                                    </div>
                                    <div
                                        id="cueEditLine-0-endTime"
                                        className="tw-form-control tw-text-center disabled"
                                        data-pr-tooltip="Timecodes are locked"
                                        data-pr-position="right"
                                        data-pr-at="right top+18"
                                    >
                                        00:00:02.000
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }} >
                                <button
                                    className="tw-dropdown-toggle tw-btn tw-btn-light"
                                    aria-controls="cueCategoryMenu"
                                    aria-haspopup
                                >
                                    Dialogue
                                </button>
                                <button
                                    className="tw-select-none tw-flex tw-items-center tw-justify-center
                                        tw-dropdown-toggle tw-btn tw-btn-light tw-w-[68px]"
                                    aria-controls="positionButtonMenu"
                                    aria-haspopup
                                >
                                    <span>↓↓</span><span className="caret" />
                                </button>
                            </div>
                        </div>
                        <div
                            className="tw-border-l tw-border-blue-light/20 tw-flex tw-items-center"
                            style={{ flex: "1 0 calc(100% - 280px)" }}
                        >
                            <CueTextEditor
                                key={1}
                                index={0}
                                vttCue={cues[0].vttCue}
                                bindCueViewModeKeyboardShortcut={jest.fn()}
                                unbindCueViewModeKeyboardShortcut={jest.fn()}
                                setGlossaryTerm={jest.fn()}
                            />
                            <CueActionsPanel index={0} cue={cues[0]} isEdit sourceCueIndexes={[]} />
                        </div>
                    </div>
                </Provider>
            );
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit
                        index={0}
                        cue={{ vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto}
                        setGlossaryTerm={jest.fn()}
                    />
                </Provider>
            );

            // THEN
            const actual = removeDraftJsDynamicValues(actualNode.html());
            const expected = removeDraftJsDynamicValues(expectedNode.html());
            expect(actual).toEqual(expected);
        });

        it("renders for translation task with timecodes unlocked", () => {
            // GIVEN
            testingStore.dispatch(
                updateEditingTrack({ ...testTranslationTrack, timecodesUnlocked: true } as Track) as {} as AnyAction);

            // noinspection HtmlUnknownAttribute
            const expectedNode = mount(
                <Provider store={testingStore}>
                    <div
                        style={{ display: "flex" }}
                        className="tw-border-b tw-border-blue-light/20 tw-bg-white tw-z-10"
                    >
                        <div
                            style={{
                                flex: "1 0 280px",
                                width: 280,
                                display: "flex",
                                flexDirection: "column",
                                padding: "5px 10px",
                                justifyContent: "space-between"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection:"column",
                                    paddingBottom: "15px"
                                }}
                            >
                                <div className="tw-space-y-1 tw-w-[140px]">
                                    <input
                                        type="text"
                                        // @ts-ignore custom attribute added by react-advanced-timefield
                                        colon=":"
                                        className="tw-form-control mousetrap tw-block tw-w-[140px] tw-text-center"
                                        value="00:00:00.000"
                                        onChange={(): void => undefined}
                                    />
                                    <input
                                        type="text"
                                        // @ts-ignore custom attribute added by react-advanced-timefield
                                        colon=":"
                                        className="tw-form-control mousetrap tw-block tw-w-[140px] tw-text-center"
                                        value="00:00:02.000"
                                        onChange={(): void => undefined}
                                    />
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }} >
                                <button
                                    className="tw-dropdown-toggle tw-btn tw-btn-light"
                                    aria-controls="cueCategoryMenu"
                                    aria-haspopup
                                >
                                    Dialogue
                                </button>
                                <button
                                    className="tw-select-none tw-flex tw-items-center tw-justify-center
                                        tw-dropdown-toggle tw-btn tw-btn-light tw-w-[68px]"
                                    aria-controls="positionButtonMenu"
                                    aria-haspopup
                                >
                                    <span>↓↓</span><span className="caret" />
                                </button>
                            </div>
                        </div>
                        <div
                            className="tw-border-l tw-border-blue-light/20 tw-flex tw-items-center"
                            style={{ flex: "1 0 calc(100% - 280px)" }}
                        >
                            <CueTextEditor
                                key={1}
                                index={0}
                                vttCue={cues[0].vttCue}
                                bindCueViewModeKeyboardShortcut={jest.fn()}
                                unbindCueViewModeKeyboardShortcut={jest.fn()}
                                setGlossaryTerm={jest.fn()}
                            />
                            <CueActionsPanel index={0} cue={cues[0]} isEdit sourceCueIndexes={[]} />
                        </div>
                    </div>
                </Provider>
            );
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit
                        index={0}
                        cue={{ vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto}
                        setGlossaryTerm={jest.fn()}
                    />
                </Provider>
            );

            // THEN
            const actual = removeDraftJsDynamicValues(actualNode.html());
            const expected = removeDraftJsDynamicValues(expectedNode.html());
            expect(actual).toEqual(expected);
        });

        it("updates cue in redux store when start time minutes changed", () => {
            // GIVEN
            testingStore.dispatch(
                updateEditingTrack( { ...testTrack, timecodesUnlocked: true } as Track) as {} as AnyAction);
            const cue = testingStore.getState().cues[1];
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={1} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find("TimeField").at(1)
                .simulate("change", { target: { value: "00:15:00.000", selectionEnd: 12 }});

            // THEN
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(900);
        });

        it("updates cue in redux store when start time seconds changed", () => {
            // GIVEN
            testingStore.dispatch(
                updateEditingTrack( { ...testTrack, timecodesUnlocked: true } as Track) as {} as AnyAction);
            const cue = testingStore.getState().cues[1];
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={1} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find("TimeField").at(1)
                .simulate("change", { target: { value: "00:00:10.000", selectionEnd: 12 }});

            // THEN
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(10);
        });

        it("updates cue in redux store when start time millis changed", () => {
            // GIVEN
            testingStore.dispatch(
                updateEditingTrack( { ...testTrack, timecodesUnlocked: true } as Track) as {} as AnyAction);
            const cue = testingStore.getState().cues[0];
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find("TimeField").at(0)
                .simulate("change", { target: { value: "00:00:00.865", selectionEnd: 12 }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(.865);
        });

        it("calls saveTrack in redux store when start time changes", () => {
            // GIVEN
            testingStore.dispatch(
                updateEditingTrack( { ...testTrack, timecodesUnlocked: true } as Track) as {} as AnyAction);
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            const cue = {
                vttCue: new VTTCue(0, 2, "Caption Line 1"),
                cueCategory: "DIALOGUE",
                editUuid: testingStore.getState().cues[0].editUuid
            } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);

            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find("TimeField").at(0)
                .simulate("change", { target: { value: "00:00:03.000", selectionEnd: 12 }});

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
        });

        it("updates cue in redux store when end time changed", () => {
            // GIVEN
            testingStore.dispatch(
                updateEditingTrack( { ...testTrack, timecodesUnlocked: true } as Track) as {} as AnyAction);
            const cue = testingStore.getState().cues[0];
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find("TimeField").at(1)
                .simulate("change", { target: { value: "00:00:02.220", selectionEnd: 12 }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2.22);
        });

        it("calls saveTrack in redux store when end time changes", () => {
            // GIVEN
            testingStore.dispatch(
                updateEditingTrack( { ...testTrack, timecodesUnlocked: true } as Track) as {} as AnyAction);
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
            const cue = {
                vttCue: new VTTCue(3, 7, "Caption Line 2"),
                cueCategory: "DIALOGUE",
                editUuid: testingStore.getState().cues[0].editUuid
            } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);

            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find("TimeField").at(1)
                .simulate("change", { target: { value: "00:00:05.500", selectionEnd: 12 }});

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
        });

        it("maintains cue styling when start time changes", () => {
            // GIVEN
            testingStore.dispatch(
                updateEditingTrack( { ...testTrack, timecodesUnlocked: true } as Track) as {} as AnyAction);
            const vttCue = new VTTCue(0, 1, "someText");
            vttCue.position = 60;
            vttCue.align = "end";
            const cue = {
                vttCue,
                cueCategory: "DIALOGUE",
                editUuid: testingStore.getState().cues[0].editUuid
            } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find("TimeField").at(0)
                .simulate("change", { target: { value: "00:15:00.000", selectionEnd: 12 }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.position).toEqual(60);
            expect(testingStore.getState().cues[0].vttCue.align).toEqual("end");
        });

        it("maintains cue styling when end time changes", () => {
            // GIVEN
            testingStore.dispatch(
                updateEditingTrack( { ...testTrack, timecodesUnlocked: true } as Track) as {} as AnyAction);
            const vttCue = new VTTCue(0, 1, "someText");
            vttCue.position = 60;
            vttCue.align = "end";
            const cue = {
                vttCue,
                cueCategory: "DIALOGUE",
                editUuid: testingStore.getState().cues[0].editUuid
            } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find("TimeField").at(0)
                .simulate("change", { target: { value: "00:00:00.222", selectionEnd: 12 }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.position).toEqual(60);
            expect(testingStore.getState().cues[0].vttCue.align).toEqual("end");
        });

        it("updates cue position", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            const cue = {
                vttCue,
                cueCategory: "DIALOGUE",
                editUuid: testingStore.getState().cues[0].editUuid
            } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find(PositionButton).props().changePosition(Position.Row2Column2);

            // THEN
            expect(testingStore.getState().cues[0].vttCue.line).toEqual(4);
            expect(testingStore.getState().cues[0].vttCue.align).toEqual("start");
            expect(testingStore.getState().cues[0].vttCue.positionAlign).toEqual("center");
            expect(testingStore.getState().cues[0].vttCue.position).toEqual(65);
        });

        it("calls saveTrack in redux store when cue position changes", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

            const vttCue = new VTTCue(0, 1, "someText");
            const cue = {
                vttCue,
                cueCategory: "DIALOGUE",
                editUuid: testingStore.getState().cues[0].editUuid
            } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find(PositionButton).props().changePosition(Position.Row2Column5);

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
        });

        it("updates line category", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            const cue = { vttCue, cueCategory: "DIALOGUE" } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find("button[aria-controls='cueCategoryMenu']").simulate("click");
            actualNode.find("#cueCategoryMenu span").at(1).simulate("click");

            // THEN
            expect(testingStore.getState().cues[0].cueCategory).toEqual("ONSCREEN_TEXT");
        });

        it("calls saveTrack in redux store when line category changes", () => {
            // GIVEN
            const saveTrack = jest.fn();
            testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

            const vttCue = new VTTCue(0, 1, "someText");
            const cue = { vttCue, cueCategory: "DIALOGUE" } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find("button[aria-controls='cueCategoryMenu']").simulate("click");
            actualNode.find("#cueCategoryMenu span").at(1).simulate("click");

            // THEN
            expect(saveTrack).toHaveBeenCalledTimes(1);
        });

        it("passes down current line category", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            const cue = { vttCue, cueCategory: "ONSCREEN_TEXT" } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // THEN
            expect(actualNode.find("button[aria-controls='cueCategoryMenu']").text())
                .toEqual("On Screen Text");
        });

        it("should set player time to video start time on mod+shift+up shortcut", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 2, "someText");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const cue = { vttCue, cueCategory: "ONSCREEN_TEXT", editUuid } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0.5) as {} as AnyAction);
            mount(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            simulant.fire(
                document.documentElement, "keydown", { keyCode: Character.ARROW_UP, shiftKey: true, altKey: true });

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0.5);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
        });

        it("should set player time to updated video start time on mod+shift+up shortcut", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 2, "someText");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const cue = { vttCue, cueCategory: "ONSCREEN_TEXT", editUuid } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0.5) as {} as AnyAction);
            const { container, rerender } = render(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );
            testingStore.dispatch(setCurrentPlayerTime(0.867) as {} as AnyAction);
            rerender(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );
            const editor = container.querySelector(".public-DraftEditor-content") as Element;

            // WHEN
            fireEvent.keyDown(editor, { keyCode: Character.ARROW_UP, shiftKey: true, altKey: true });

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0.867);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
        });

        it("should set player time to video end time on mod+shift+down shortcut", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 2, "someText");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const cue = { vttCue, cueCategory: "ONSCREEN_TEXT", editUuid } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);
            mount(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            simulant.fire(
                document.documentElement, "keydown", { keyCode: Character.ARROW_DOWN, shiftKey: true, altKey: true });

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1);
        });

        it("should set player time to updated video end time on mod+shift+down shortcut", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 2, "someText");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const cue = { vttCue, cueCategory: "ONSCREEN_TEXT", editUuid } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(1.0) as {} as AnyAction);
            const { container, rerender } = render(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );
            testingStore.dispatch(setCurrentPlayerTime(1.781) as {} as AnyAction);
            rerender(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );
            const editor = container.querySelector(".public-DraftEditor-content") as Element;

            // WHEN
            fireEvent.keyDown(editor, { keyCode: Character.ARROW_DOWN, shiftKey: true, altKey: true });

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1.781);
        });

        it.skip("should limit editing cue time to next cue", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 4, "someText");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const cue = { vttCue, cueCategory: "ONSCREEN_TEXT", editUuid } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);

            // WHEN
            mount(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(3);
        });

        it.skip("should not limit editing cue time to next cue if last cue", () => {
            // GIVEN
            const vttCue = new VTTCue(7, 50, "someText");
            const editUuid = testingStore.getState().cues[1].editUuid;
            const cue = { vttCue, cueCategory: "ONSCREEN_TEXT", editUuid } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);

            // WHEN
            mount(
                <Provider store={testingStore} >
                    <CueEdit index={1} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // THEN
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(7);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(50);
        });

        it("increases cue startTime to max value relative" +
            " to cue endtime if arrow up shortcut clicked and player time overlaps", () => {
            // GIVEN
            const cue = testingStore.getState().cues[0];
            testingStore.dispatch(setCurrentPlayerTime(1.6) as {} as AnyAction);

            // WHEN
            mount(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );
            simulant.fire(
                document.documentElement, "keydown",
                { keyCode: Character.ARROW_UP, shiftKey: true, altKey: true });


            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1.5);
        });

        it("Sets cue endtime to min value relative" +
            " to cue start time if arrow down shortcut clicked and player time overlaps", () => {
            // GIVEN
            const cue = testingStore.getState().cues[0];
            testingStore.dispatch(setCurrentPlayerTime(0.4) as {} as AnyAction);

            // WHEN
            mount(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );
            simulant.fire(
                document.documentElement, "keydown",
                { keyCode: Character.ARROW_DOWN, shiftKey: true, altKey: true });


            // THEN
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(0.5);
        });

        it("Force set startTime to max value if passed invalid startTime range value", () => {
            // GIVEN
            testingStore.dispatch(
                updateEditingTrack( { ...testTrack, timecodesUnlocked: true } as Track) as {} as AnyAction);
            const cue = testingStore.getState().cues[0];
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find("TimeField").at(0)
                .simulate("change", { target: { value: "00:00:01.600", selectionEnd: 12  }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1.5);
        });

        it("Force set endtime to lowest value if passed invalid endtime range value", () => {
            // GIVEN
            testingStore.dispatch(
                updateEditingTrack( { ...testTrack, timecodesUnlocked: true } as Track) as {} as AnyAction);
            const cue = testingStore.getState().cues[0];
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find("TimeField").at(1)
                .simulate("change", { target: { value: "00:00:00.400", selectionEnd: 12  }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(0.5);
        });

        it("Force set endtime to lowest value if passed endtime value equals to startime", () => {
            // GIVEN
            testingStore.dispatch(
                updateEditingTrack( { ...testTrack, timecodesUnlocked: true } as Track) as {} as AnyAction);
            const cue = testingStore.getState().cues[0];
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            actualNode.find("TimeField").at(1)
                .simulate("change", { target: { value: "00:00:00.000", selectionEnd: 12  }});

            // THEN
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(0.5);
        });

        it("plays cue when play shortcut is typed", () => {
            // GIVEN
            const vttCue = new VTTCue(1.6, 3, "someText");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const cue = { vttCue, cueCategory: "ONSCREEN_TEXT", editUuid } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);
            mount(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            simulant.fire(
                document.documentElement, "keydown", { keyCode: Character.K_CHAR, shiftKey: true, altKey: true });

            // THEN
            expect(testingStore.getState().videoSectionToPlay).toEqual({ startTime: 1.6, endTime: 3 });
        });

        it("adds cue when ENTER is pressed on last caption cue", () => {
            // GIVEN
            const editUuid = testingStore.getState().cues[0].editUuid;
            const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE", editUuid } as CueDto;
            testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);
            mount(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            simulant.fire(
                document.documentElement, "keydown", { keyCode: Character.ENTER });


            // THEN
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(1);
        });

        it("adds cue when on ENTER for last translation cue, " +
            "where cue index is smaller than amount of source cues", () => {
            // GIVEN
            const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
            testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);
            mount(
                <Provider store={testingStore} >
                    <CueEdit
                        index={0}
                        cue={cue}
                        nextCueLine={{ sourceCues: [{ index: 1, cue: sourceCues[1] }]}}
                        setGlossaryTerm={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            simulant.fire(
                document.documentElement, "keydown", { keyCode: Character.ENTER });


            // THEN
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2);
        });

        it("doesn't add cue when ENTER is pressed on last caption cue out of range of chunk", () => {
            // GIVEN
            const chunkTrack = { ...testTrack, mediaChunkStart: 0, mediaChunkEnd: 1000 };
            testingStore.dispatch(updateEditingTrack(chunkTrack as Track) as {} as AnyAction);
            const editUuid = testingStore.getState().cues[0].editUuid;
            const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE", editUuid } as CueDto;
            testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);
            mount(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            simulant.fire(
                document.documentElement, "keydown", { keyCode: Character.ENTER });


            // THEN
            expect(testingStore.getState().cues.length).toEqual(1);
            expect(testingStore.getState().editingCueIndex).toEqual(0);
        });

        it("adds cue when ENTER is pressed on last caption cue in range of chunk", () => {
            // GIVEN
            const chunkTrack = { ...testTrack, mediaChunkStart: 0, mediaChunkEnd: 5000 };
            testingStore.dispatch(updateEditingTrack(chunkTrack as Track) as {} as AnyAction);
            const editUuid = testingStore.getState().cues[0].editUuid;
            const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE", editUuid } as CueDto;
            testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);
            mount(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            simulant.fire(
                document.documentElement, "keydown", { keyCode: Character.ENTER });


            // THEN
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(1);
        });

        it("doesn't add cue when on ENTER for last translation cue, where cue index is smaller than amount " +
            "of source cues, out of range for chunk", () => {
            // GIVEN
            const chunkTrack = { ...testTrack, mediaChunkStart: 0, mediaChunkEnd: 1000 };
            testingStore.dispatch(updateEditingTrack(chunkTrack as Track) as {} as AnyAction);
            const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
            testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);

            mount(
                <Provider store={testingStore} >
                    <CueEdit
                        index={0}
                        cue={cue}
                        nextCueLine={{ sourceCues: [{ index: 1, cue: sourceCues[1] }]}}
                        setGlossaryTerm={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            simulant.fire(
                document.documentElement, "keydown", { keyCode: Character.ENTER });


            // THEN
            expect(testingStore.getState().cues.length).toEqual(1);
            expect(testingStore.getState().editingCueIndex).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1);
        });

        it("adds cue when on ENTER for last translation cue, where cue index is smaller than amount " +
            "of source cues, within range for chunk", () => {
            // GIVEN
            const chunkTrack = { ...testTrack, mediaChunkStart: 0, mediaChunkEnd: 2000 };
            testingStore.dispatch(updateEditingTrack(chunkTrack as Track) as {} as AnyAction);
            const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
            testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Source Line 2"), cueCategory: "DIALOGUE",
                    editDisabled: true },
            ] as CueDto[];
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);

            mount(
                <Provider store={testingStore} >
                    <CueEdit
                        index={0}
                        cue={cue}
                        nextCueLine={{ sourceCues: [{ index: 1, cue: sourceCues[1] }]}}
                        setGlossaryTerm={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            simulant.fire(
                document.documentElement, "keydown", { keyCode: Character.ENTER });


            // THEN
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2);
        });

        it("adds cue when on ENTER for last translation cue, when there are no more source cues", () => {
            // GIVEN
            const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
            testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
            const sourceCues = [{ vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" }] as CueDto[];
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);

            mount(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            simulant.fire(
                document.documentElement, "keydown", { keyCode: Character.ENTER });


            // THEN
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
        });

        it("moves cue editing mode to next cue when ENTER is pressed on non-last", () => {
            // GIVEN
            const cues = [{ vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" }] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);

            mount(
                <Provider store={testingStore} >
                    <CueEdit
                        index={0}
                        cue={cues[0]}
                        nextCueLine={{ sourceCues: [{ index: 1, cue: sourceCues[1] }]}}
                        setGlossaryTerm={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            simulant.fire(document.documentElement, "keydown", { keyCode: Character.ENTER });

            // THEN
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(1);
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2);
        });

        it("doesn't move cue editing mode to next cue when ENTER is pressed on non-last if out of chunk range",
            () => {
                // GIVEN
                const chunkTrack = { ...testTrack, mediaChunkStart: 0, mediaChunkEnd: 1000 };
                testingStore.dispatch(updateEditingTrack(chunkTrack as Track) as {} as AnyAction);
                const cues = [{ vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" }] as CueDto[];
                const sourceCues = [
                    { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE",
                        editDisabled: true },
                ] as CueDto[];

                testingStore.dispatch(updateCues(cues) as {} as AnyAction);
                testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
                testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);

                mount(
                    <Provider store={testingStore} >
                        <CueEdit
                            index={0}
                            cue={cues[0]}
                            nextCueLine={{ sourceCues: [{ index: 1, cue: sourceCues[1] }]}}
                            setGlossaryTerm={jest.fn()}
                        />
                    </Provider>
                );

                // WHEN
                simulant.fire(document.documentElement, "keydown", { keyCode: Character.ENTER });

                // THEN
                expect(testingStore.getState().cues.length).toEqual(1);
                expect(testingStore.getState().editingCueIndex).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
                expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1);
            });

        it("doesn't move cue editing mode to next cue when ENTER is pressed on non-last if cue is editDisabled",
            () => {
                // GIVEN
                const cues = [
                    { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                    { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE",
                        editDisabled: true },
                ] as CueDto[];

                testingStore.dispatch(updateCues(cues) as {} as AnyAction);
                testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
                testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);
                mount(
                    <Provider store={testingStore} >
                        <CueEdit index={0} cue={cues[0]} setGlossaryTerm={jest.fn()} />
                    </Provider>
                );

                // WHEN
                simulant.fire(document.documentElement, "keydown", { keyCode: Character.ENTER });

                // THEN
                expect(testingStore.getState().cues.length).toEqual(2);
                expect(testingStore.getState().editingCueIndex).toEqual(0);
                expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
                expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2);
            });

        it("created new cue on ENTER where next cue line/match doest have target cue", () => {
            // GIVEN
            const cues = [
                { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);
            mount(
                <Provider store={testingStore} >
                    <CueEdit
                        index={0}
                        cue={cues[0]}
                        nextCueLine={{ targetCues: [{ index: 1, cue: cues[1] }]}}
                        setGlossaryTerm={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            simulant.fire(document.documentElement, "keydown", { keyCode: Character.ENTER });

            // THEN
            expect(testingStore.getState().cues.length).toEqual(2);
            expect(testingStore.getState().editingCueIndex).toEqual(1);
        });

        it("closes cue editing mode when ESCAPE is pressed", () => {
            // GIVEN
            const cue = { vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE" } as CueDto;
            testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);
            mount(
                <Provider store={testingStore} >
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            simulant.fire(
                document.documentElement, "keydown", { keyCode: Character.ESCAPE });

            // THEN
            expect(testingStore.getState().cues.length).toEqual(1);
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });

        it("uses source cues times when new cue is inserted via + button", async () => {
            // GIVEN
            const sourceCues = [
                { vttCue: new VTTCue(2.1, 2.5, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2.6, 2.8, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const cue = {
                vttCue: new VTTCue(1, 2, "some text"),
                cueCategory: "DIALOGUE"
            } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore} >
                    <CueEdit
                        index={0}
                        cue={cue}
                        nextCueLine={{
                            sourceCues: [{ index: 0, cue: sourceCues[0] }, { index: 1, cue: sourceCues[1] }]
                        }}
                        setGlossaryTerm={jest.fn()}
                    />
                </Provider>
            );

            // WHEN
            await act(async () => {
                fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);
            });

            // THEN
            expect(testingStore.getState().cues).toHaveLength(3);
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("");
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2.1);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(2.8);
        });

        it("edits previous cue ALT+SHIFT+ESCAPE is pressed", () => {
            // GIVEN
            const cues = [
                { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Cue 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
            testingStore.dispatch(setCurrentPlayerTime(2) as {} as AnyAction);
            mount(
                <Provider store={testingStore} >
                    <CueEdit index={2} cue={cues[2]} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            simulant.fire(
                document.documentElement, "keydown", { keyCode: Character.ESCAPE, shiftKey: true, altKey: true });

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(1);
        });

        it("edits previous cue CTRL+SHIFT+ESCAPE is pressed", () => {
            // GIVEN
            const cues = [
                { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Cue 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
            testingStore.dispatch(setCurrentPlayerTime(2) as {} as AnyAction);
            mount(
                <Provider store={testingStore} >
                    <CueEdit index={2} cue={cues[2]} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            simulant.fire(
                document.documentElement, "keydown", { keyCode: Character.ESCAPE, shiftKey: true, ctrlKey: true });

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(1);
        });

        it("edits last cue startTime(currentPlayerTime) and endTime(currentPlayerTime + 3) on ALT+SHIFT+UP", () => {
            // GIVEN
            const cues = [
                { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Cue 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const currentPlayer = 2.345;
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);
            testingStore.dispatch(setCurrentPlayerTime(currentPlayer) as {} as AnyAction);
            mount(
                <Provider store={testingStore} >
                    <CueEdit index={2} cue={cues[2]} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // WHEN
            simulant.fire(
                document.documentElement, "keydown", { keyCode: Character.ARROW_UP, shiftKey: true, altKey: true }
            );

            // THEN
            const editingCueIndex =  testingStore.getState().editingCueIndex;
            const lastCueIndex = testingStore.getState().cues.length - 1;
            expect(editingCueIndex).toEqual(2);
            expect(testingStore.getState().cues[lastCueIndex].vttCue.startTime).toEqual(currentPlayer);
            expect(testingStore.getState().cues[lastCueIndex].vttCue.endTime).toEqual(currentPlayer + 3);
        });

        it("passes down spell check into editor component", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            const testingSpellCheck = { matches: [{ message: "test-spell-check" }]} as SpellCheck;
            const cue = { vttCue, cueCategory: "ONSCREEN_TEXT", spellCheck: testingSpellCheck } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // THEN
            expect(actualNode.find(CueTextEditor).props().spellCheck).toEqual(testingSpellCheck);
        });

        it("passes down search replace matches into editor component", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            const testingSearchReplace = { offsets: [10, 20], offsetIndex: 0, matchLength: 5 } as SearchReplaceMatches;
            const cue = { vttCue, cueCategory: "ONSCREEN_TEXT", searchReplaceMatches: testingSearchReplace } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // THEN
            expect(actualNode.find(CueTextEditor).props().searchReplaceMatches).toEqual(testingSearchReplace);
        });

        it("passes down bindCueViewModeKeyboardShortcut to editor component", () => {
            // GIVEN
            const vttCue = new VTTCue(0, 1, "someText");
            const testingSpellCheck = { matches: [{ message: "test-spell-check" }]} as SpellCheck;
            const cue = { vttCue, cueCategory: "ONSCREEN_TEXT", spellCheck: testingSpellCheck } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // THEN
            expect(actualNode.find(CueTextEditor).props().bindCueViewModeKeyboardShortcut).not.toBeNull();
        });
    });

    describe("unbind shortcuts", () => {
        // TODO: It seems tests in this file are somehow affecting each other and in this group is nested beforeEach.
        // Nested beforeEach is extremely terrible idea to me. After fixing totally unrelated tests,
        // one of tests from this group started failing. I don't fully understand these test cases and had to do
        // hacky tricks to make these tests run. We should really fix this situation.
        beforeEach(() => {
            const spellCheck = {
                matches: [
                    {
                        offset: 0, length: 8, replacements: [{ "value": "Some Text" }] as Replacement[],
                        context: { text: "someText", offset: 0, length: 8 },
                        rule: { id: "MORFOLOGIK_RULE_EN_US" }
                    }
                ]
            } as SpellCheck;
            const cue = {
                vttCue: new VTTCue(0, 1, "someText"), cueCategory: "DIALOGUE",
                spellCheck: spellCheck
            } as CueDto;
            testingStore.dispatch(updateCues([cue]) as {} as AnyAction);
            const sourceCues = [{ vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" }] as CueDto[];
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            const trackId = "0fd7af04-6c87-4793-8d66-fdb19b5fd04d";

            const testingTrack = {
                type: "CAPTION",
                language: { id: "en-US", name: "English (US)" } as Language,
                default: true,
                mediaTitle: "This is the video title",
                mediaLength: 4000,
                progress: 50,
                id: trackId
            } as Track;
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);


            // @ts-ignore modern browsers does have it
            global.fetch = jest.fn()
                .mockImplementationOnce(() => new Promise((resolve) =>
                    resolve({ json: () => spellCheck })));
        });

        it("passes down unbindCueViewModeKeyboardShortcut to editor component", () => {
            // GIVEN
            testingStore = createTestingStore();
            const vttCue = new VTTCue(0, 1, "someText");
            const testingSpellCheck = { matches: [{ message: "test-spell-check" }]} as SpellCheck;
            const cue = { vttCue, cueCategory: "ONSCREEN_TEXT", spellCheck: testingSpellCheck } as CueDto;
            testingStore.dispatch(setCurrentPlayerTime(0) as {} as AnyAction);

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={cue} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            // THEN
            expect(actualNode.find(CueTextEditor).props().unbindCueViewModeKeyboardShortcut).not.toBeNull();
        });

        it("unbinds ENTER shortcut when spellchecker dropdown is on", () => {
            // GIVEN
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);
            const { container } = render(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={testingStore.getState().cues[0]} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            const errorSpan = container.querySelectorAll(".sbte-text-with-error")[0] as Element;
            fireEvent(errorSpan,
                new MouseEvent("click", {
                    bubbles: true,
                    cancelable: true,
                })
            );

            // WHEN
            fireEvent.keyDown(container, { keyCode: Character.ENTER });


            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(0);
        });

        it("unbinds ESCAPE shortcut when spellchecker dropdown is on", () => {
            // GIVEN
            testingStore.dispatch(setCurrentPlayerTime(1) as {} as AnyAction);
            const { container } = render(
                <Provider store={testingStore}>
                    <CueEdit index={0} cue={testingStore.getState().cues[0]} setGlossaryTerm={jest.fn()} />
                </Provider>
            );

            const errorSpan = container.querySelectorAll(".sbte-text-with-error")[0] as Element;
            fireEvent(errorSpan,
                new MouseEvent("click", {
                    bubbles: true,
                    cancelable: true,
                })
            );

            // WHEN
            fireEvent.keyDown(container, { keyCode: Character.ESCAPE });


            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(0);
        });
    });

});
