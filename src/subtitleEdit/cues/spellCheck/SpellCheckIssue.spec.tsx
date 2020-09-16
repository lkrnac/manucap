/**  * @jest-environment jsdom-sixteen  */
import "../../../testUtils/initBrowserEnvironment";
import React, { RefObject } from "react";
import { mount } from "enzyme";
import { SpellCheckIssue } from "./SpellCheckIssue";
import { SpellCheck } from "./model";
import { Overlay } from "react-bootstrap";
import { spellCheckOptionPredicate } from "../../../testUtils/testUtils";
import { Provider } from "react-redux";
import testingStore from "../../../testUtils/testingStore";

const removeSelectCssClass = (htmlString: string): string =>
    htmlString.replace(/react-select-\d{1,4}-+/g, "");

describe("SpellCheckerIssue", () => {
    const emptyEditorRef = {} as RefObject<HTMLInputElement>;
    const bindCueViewModeKeyboardShortcutSpy = jest.fn();
    const unbindCueViewModeKeyboardShortcutSpy = jest.fn();
    const trackId = "0fd7af04-6c87-4793-8d66-fdb19b5fd04d";
    const cueId = "b3fd447e-513d-4328-ada9-c96a19d684e1";
    const ruleId = "MORFOLOGIK_RULE_EN_US";
    const spellCheck = {
        matches: [
            {
                message: "There is error",
                replacements: [],
                offset: 15,
                length: 3,
                context: { text: "asd", length: 3, offset: 15 },
                rule: { id: ruleId }
            }
        ]
    } as SpellCheck;

    it("renders without popup", () => {
        // GIVEN
        const expectedNode = mount(
            <span className="sbte-text-with-error">
                <div className="text" />
            </span>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SpellCheckIssue
                    trackId={trackId}
                    cueId={cueId}
                    cueIdx={0}
                    decoratedText="asd"
                    spellCheck={spellCheck}
                    start={15}
                    end={18}
                    correctSpelling={jest.fn()}
                    setSpellCheckerMatchingOffset={jest.fn()}
                    spellCheckerMatchingOffset={null}
                    editorRef={emptyEditorRef}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                >
                    <div className="text" />
                </SpellCheckIssue>
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("does not render issue if start doesn't match", () => {
        // GIVEN
        const expectedNode = mount(<div className="text" />);

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SpellCheckIssue
                    trackId={trackId}
                    cueId={cueId}
                    cueIdx={0}
                    decoratedText="asd"
                    spellCheck={spellCheck}
                    start={13}
                    end={18}
                    correctSpelling={jest.fn()}
                    setSpellCheckerMatchingOffset={jest.fn()}
                    spellCheckerMatchingOffset={null}
                    editorRef={emptyEditorRef}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                >
                    <div className="text" />
                </SpellCheckIssue>
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("does not render issue if end doesn't match", () => {
        // GIVEN
        const expectedNode = mount(<div className="text" />);

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SpellCheckIssue
                    trackId={trackId}
                    cueId={cueId}
                    cueIdx={0}
                    decoratedText="asd"
                    spellCheck={spellCheck}
                    start={15}
                    end={17}
                    correctSpelling={jest.fn()}
                    setSpellCheckerMatchingOffset={jest.fn()}
                    spellCheckerMatchingOffset={null}
                    editorRef={emptyEditorRef}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                >
                    <div className="text" />
                </SpellCheckIssue>
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders popup with options when clicked", () => {
        // GIVEN
        const expectedNode = mount(
            <div
                role="tooltip"
                style={{
                    position: "absolute",
                    top: "0px",
                    left: "0px",
                    opacity: 0,
                    pointerEvents: "none",
                    margin: "0px"
                }}
                x-placement="bottom"
                className="fade show popover bs-popover-bottom"
                id="sbte-spell-check-popover"
            >
                <div className="arrow" style={{ margin: "0px" }} />
                <div className="popover-header">There is error</div>
                <div style={{ padding: "0px" }} className="popover-body">
                    <div className=" css-6iiga6-container">
                        <div className="spellcheck__control spellcheck__control--menu-is-open css-1rdv9e-Control">
                            <div className="spellcheck__value-container css-g1d714-ValueContainer">
                                <div className="spellcheck__placeholder css-1wa3eu0-placeholder">Select...</div>
                                <div className="css-b8ldur-Input">
                                    <div
                                        className="spellcheck__input"
                                        style={{ display: "inline-block" }}
                                    >
                                        <input
                                            autoCapitalize="none"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            id="react-select-2-input"
                                            spellCheck="false"
                                            tabIndex={0}
                                            type="text"
                                            aria-autocomplete="list"
                                            style={{
                                                boxSizing: "content-box",
                                                width: "2px",
                                                border: "0px",
                                                fontSize: "inherit",
                                                opacity: 1,
                                                outline: 0,
                                                padding: "0px"
                                            }}
                                            value=""
                                            onChange={jest.fn()}
                                        />
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "0px",
                                                left: "0px",
                                                visibility: "hidden",
                                                height: "0px",
                                                overflow: "scroll",
                                                whiteSpace: "pre",
                                                fontSize: "inherit",
                                                fontFamily: "-webkit-small-control",
                                                letterSpacing: "normal",
                                                textTransform: "none"
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="spellcheck__indicators css-1hb7zxy-IndicatorsContainer">
                                <span className="spellcheck__indicator-separator css-1okebmr-indicatorSeparator" />
                                <div
                                    aria-hidden="true"
                                    className="spellcheck__indicator
                                 spellcheck__dropdown-indicator css-tlfecz-indicatorContainer"
                                >
                                    <svg
                                        height="20"
                                        width="20"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                        focusable="false"
                                        className="css-6q0nyr-Svg"
                                    >
                                        <path
                                            d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747
                                            3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0
                                            1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787
                                            0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17
                                            0-1.615z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="spellcheck__menu css-13tc85z-menu">
                            <div className="spellcheck__menu-list css-1n56l4k-MenuList">
                                <div
                                    className="spellcheck__option css-yt9ioa-option"
                                    id="react-select-2-option-0"
                                    tabIndex={-1}
                                >Ignore
                                </div>
                                <div
                                    className="spellcheck__option css-yt9ioa-option"
                                    id="react-select-2-option-1"
                                    tabIndex={-1}
                                >
                                    repl1
                                </div>
                                <div
                                    className="spellcheck__option css-yt9ioa-option"
                                    id="react-select-2-option-2"
                                    tabIndex={-1}
                                >
                                    repl2
                                </div>
                                <div
                                    className="spellcheck__option css-yt9ioa-option"
                                    id="react-select-2-option-3"
                                    tabIndex={-1}
                                >
                                    repl3
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

        const spellCheck = {
            matches: [
                {
                    message: "There is error",
                    replacements: [{ value: "repl1" }, { value: "repl2" }, { value: "repl3" }],
                    offset: 15,
                    length: 3,
                    context: { text: "asd", length: 3, offset: 15 },
                    rule: { id: ruleId }
                }
            ]
        } as SpellCheck;

        const actualNode = mount(
            <Provider store={testingStore}>
                <SpellCheckIssue
                    trackId={trackId}
                    cueId={cueId}
                    cueIdx={0}
                    decoratedText="asd"
                    spellCheck={spellCheck}
                    start={15}
                    end={18}
                    correctSpelling={jest.fn()}
                    setSpellCheckerMatchingOffset={jest.fn()}
                    spellCheckerMatchingOffset={15}
                    editorRef={emptyEditorRef}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                >
                    <div className="text" />
                </SpellCheckIssue>
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-text-with-error").simulate("click");

        // THEN
        expect(actualNode.find("#sbte-spell-check-popover").at(0).html()).toEqual(expectedNode.html());
    });

    it("renders popup without options when clicked", () => {
        // GIVEN
        const expectedNode = mount(
            <div
                role="tooltip"
                style={{
                    position: "absolute",
                    top: "0px",
                    left: "0px",
                    opacity: 0,
                    pointerEvents: "none",
                    margin: "0px"
                }}
                x-placement="bottom"
                className="fade show popover bs-popover-bottom"
                id="sbte-spell-check-popover"
            >
                <div className="arrow" style={{ margin: "0px" }} />
                <div className="popover-header">There is error</div>
                <div style={{ padding: "0px" }} className="popover-body">
                    <div className=" css-6iiga6-container">
                        <div className="spellcheck__control spellcheck__control--menu-is-open css-1rdv9e-Control">
                            <div className="spellcheck__value-container css-g1d714-ValueContainer">
                                <div className="spellcheck__placeholder css-1wa3eu0-placeholder">Select...</div>
                                <div className="css-b8ldur-Input">
                                    <div className="spellcheck__input" style={{ display: "inline-block" }}>
                                        <input
                                            autoCapitalize="none"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            id="react-select-2-input"
                                            spellCheck="false"
                                            tabIndex={0}
                                            type="text"
                                            aria-autocomplete="list"
                                            style={{
                                                boxSizing: "content-box",
                                                width: "2px",
                                                border: "0px",
                                                fontSize: "inherit",
                                                opacity: 1,
                                                outline: 0,
                                                padding: "0px"
                                            }}
                                            value=""
                                            onChange={jest.fn()}
                                        />
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "0px",
                                                left: "0px",
                                                visibility: "hidden",
                                                height: "0px",
                                                overflow: "scroll",
                                                whiteSpace: "pre",
                                                fontSize: "inherit",
                                                fontFamily: "-webkit-small-control",
                                                letterSpacing: "normal",
                                                textTransform: "none"
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="spellcheck__indicators css-1hb7zxy-IndicatorsContainer">
                                <span className="spellcheck__indicator-separator css-1okebmr-indicatorSeparator" />
                                <div
                                    aria-hidden="true"
                                    className="spellcheck__indicator
                                 spellcheck__dropdown-indicator css-tlfecz-indicatorContainer"
                                >
                                    <svg
                                        height="20"
                                        width="20"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                        focusable="false"
                                        className="css-6q0nyr-Svg"
                                    >
                                        <path
                                            d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747
                                            3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0
                                            1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787
                                            0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17
                                            0-1.615z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="spellcheck__menu css-13tc85z-menu">
                            <div className="spellcheck__menu-list css-1n56l4k-MenuList">
                                <div
                                    className="spellcheck__option css-yt9ioa-option"
                                    id="react-select-2-option-0"
                                    tabIndex={-1}
                                >Ignore
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
        const actualNode = mount(
            <Provider store={testingStore}>
                <SpellCheckIssue
                    trackId={trackId}
                    cueId={cueId}
                    cueIdx={0}
                    decoratedText="asd"
                    spellCheck={spellCheck}
                    start={15}
                    end={18}
                    correctSpelling={jest.fn()}
                    setSpellCheckerMatchingOffset={jest.fn()}
                    spellCheckerMatchingOffset={15}
                    editorRef={emptyEditorRef}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                >
                    <div className="text" />
                </SpellCheckIssue>
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-text-with-error").simulate("click");

        // THEN
        expect(removeSelectCssClass(actualNode.find("#sbte-spell-check-popover").at(0).html()))
            .toEqual(removeSelectCssClass(expectedNode.html()));
    });

    it("calls callback with selection when clicked", () => {
        // GIVEN
        const handler = jest.fn();

        const spellCheck = {
            matches: [
                {
                    message: "There is error",
                    replacements: [{ value: "repl1" }, { value: "repl2" }, { value: "repl3" }],
                    offset: 15,
                    length: 3,
                    context: { text: "asd", length: 3, offset: 15 },
                    rule: { id: ruleId }
                }
            ]
        } as SpellCheck;

        const actualNode = mount(
            <Provider store={testingStore}>
                <SpellCheckIssue
                    trackId={trackId}
                    cueId={cueId}
                    cueIdx={0}
                    decoratedText="asd"
                    spellCheck={spellCheck}
                    start={15}
                    end={18}
                    correctSpelling={handler}
                    setSpellCheckerMatchingOffset={jest.fn()}
                    spellCheckerMatchingOffset={15}
                    editorRef={emptyEditorRef}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                >
                    <div className="text" />
                </SpellCheckIssue>
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-text-with-error").simulate("click");
        actualNode.findWhere(spellCheckOptionPredicate(2)).simulate("click");

        // THEN
        expect(handler).toBeCalledWith("repl2", 15, 18);
    });

    // it("renders popup on top when there is enough space for in the window", () => {
    //     // GIVEN
    //     // @ts-ignore
    //     // noinspection JSConstantReassignment
    //     window.innerHeight = 100;
    //     let spellCheckerMatchingOffset = 15;
    //     const setSpellCheckerMatchingOffset = (id: number | null): void => {
    //         spellCheckerMatchingOffset = id;
    //     };
    //     const { container } = render(
    //         <Provider store={testingStore}>
    //             <SpellCheckIssue
    //                 trackId={trackId}
    //                 cueId={cueId}
    //                 cueIdx={0}
    //                 decoratedText="asd"
    //                 spellCheck={spellCheck}
    //                 start={15}
    //                 end={18}
    //                 correctSpelling={jest.fn()}
    //                 setSpellCheckerMatchingOffset={setSpellCheckerMatchingOffset}
    //                 spellCheckerMatchingOffset={15}
    //                 editorRef={emptyEditorRef}
    //                 bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
    //                 unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
    //             >
    //                 <div className="text" />
    //             </SpellCheckIssue>
    //         </Provider>
    //     );
    //
    //     // WHEN
    //     act(()=> {
    //         fireEvent(
    //             container.querySelector(".sbte-text-with-error") as Element,
    //             new MouseEvent("click", {
    //                 bubbles: true,
    //                 cancelable: true,
    //             })
    //         );
    //     });
    //
    //
    //     // THEN
    //     expect(container.find(Overlay).at(0).props().placement).toEqual("top");
    // });

    it("renders popup on bottom when there is enough space for in the window", () => {
        // GIVEN
        // @ts-ignore
        // noinspection JSConstantReassignment
        window.innerHeight = 1000;
        const actualNode = mount(
            <Provider store={testingStore}>
                <SpellCheckIssue
                    trackId={trackId}
                    cueId={cueId}
                    cueIdx={0}
                    decoratedText="asd"
                    spellCheck={spellCheck}
                    start={15}
                    end={18}
                    correctSpelling={jest.fn()}
                    setSpellCheckerMatchingOffset={jest.fn()}
                    spellCheckerMatchingOffset={null}
                    editorRef={emptyEditorRef}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                >
                    <div className="text" />
                </SpellCheckIssue>
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-text-with-error").simulate("click");

        // THEN
        expect(actualNode.find(Overlay).at(0).props().placement).toEqual("bottom");
    });
});
