import "../../../testUtils/initBrowserEnvironment";
import { CSSProperties, RefObject } from "react";
import { mount } from "enzyme";
import { SpellCheckIssue } from "./SpellCheckIssue";
import { SpellCheck } from "./model";
import { Overlay } from "react-bootstrap";
import { spellCheckOptionPredicate } from "../../../testUtils/testUtils";
import Select from "react-select";
import { StylesConfig } from "react-select/dist/declarations/src/styles";

jest.mock("react-redux");
const removeSelectCssClass = (htmlString: string): string =>
    htmlString.replace(/react-select-\d{1,4}-+/g, "");

describe("SpellCheckerIssue", () => {

    const emptyEditorRef = {} as RefObject<HTMLInputElement>;
    const bindCueViewModeKeyboardShortcutSpy = jest.fn();
    const unbindCueViewModeKeyboardShortcutSpy = jest.fn();
    const trackId = "0fd7af04-6c87-4793-8d66-fdb19b5fd04d";
    const ruleId = "MORFOLOGIK_RULE_EN_US";
    const spellCheck = {
        matches: [
            {
                message: "There is error",
                replacements: [{ value: "error" }],
                offset: 15,
                length: 3,
                context: { text: "some <i>HTML</i> <b>Text</b> sample", length: 3, offset: 15 },
                rule: { id: ruleId }
            }
        ]
    } as SpellCheck;
    const customStyles = {
        control: () => ({ visibility: "hidden", height: "0px" }),
        container: (provided: CSSProperties) => ({ ...provided, height: "100%" }),
        menu: (provided: CSSProperties) => ({ ...provided, position: "static", height: "100%", margin: 0 }),
        menuList: (provided: CSSProperties) => ({ ...provided, height: "200px" })
    } as StylesConfig;

    it("renders without popup", () => {
        // GIVEN
        const expectedNode = mount(
            <span className="sbte-text-with-error">
                <div className="text" />
            </span>
        );

        // WHEN
        const actualNode = mount(
            <SpellCheckIssue
                trackId={trackId}
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
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("does not render issue if start doesn't match", () => {
        // GIVEN
        const expectedNode = mount(<div className="text" />);

        // WHEN
        const actualNode = mount(
            <SpellCheckIssue
                trackId={trackId}
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
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("does not render issue if end doesn't match", () => {
        // GIVEN
        const expectedNode = mount(<div className="text" />);

        // WHEN
        const actualNode = mount(
            <SpellCheckIssue
                trackId={trackId}
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
                    <Select
                        menuIsOpen
                        styles={customStyles}
                        options={[
                            { value: "", label: "Ignore all in this track" },
                            { value: "repl1", label: "repl1" },
                            { value: "repl2", label: "repl2" },
                            { value: "repl3", label: "repl3" }
                        ]}
                        classNamePrefix="spellcheck"
                    />
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
            <SpellCheckIssue
                trackId={trackId}
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
        );

        // WHEN
        actualNode.find(".sbte-text-with-error").simulate("click");

        // THEN
        expect(removeSelectCssClass(actualNode.find("#sbte-spell-check-popover").at(0).html()))
            .toEqual(removeSelectCssClass(expectedNode.html()));
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
                    <Select
                        menuIsOpen
                        styles={customStyles}
                        options={[
                            { value: "", label: "Ignore all in this track" },
                            { value: "error", label: "error" }
                        ]}
                        classNamePrefix="spellcheck"
                    />
                </div>
            </div>
        );
        const actualNode = mount(
            <SpellCheckIssue
                trackId={trackId}
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
            <SpellCheckIssue
                trackId={trackId}
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
        );

        // WHEN
        actualNode.find(".sbte-text-with-error").simulate("click");
        actualNode.findWhere(spellCheckOptionPredicate(2)).simulate("click");

        // THEN
        expect(handler).toBeCalledWith("repl2", 15, 18);
    });

    it("renders popup on top when there is enough space for in the window", () => {
        // GIVEN
        // @ts-ignore
        // noinspection JSConstantReassignment
        window.innerHeight = 100;
        let spellCheckerMatchingOffset = null;
        const setSpellCheckerMatchingOffset = (id: number | null): void => {
            spellCheckerMatchingOffset = id;
        };
        const actualNode = mount(
            <SpellCheckIssue
                trackId={trackId}
                spellCheck={spellCheck}
                start={15}
                end={18}
                correctSpelling={jest.fn()}
                setSpellCheckerMatchingOffset={setSpellCheckerMatchingOffset}
                spellCheckerMatchingOffset={spellCheckerMatchingOffset}
                editorRef={emptyEditorRef}
                bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
            >
                <div className="text" />
            </SpellCheckIssue>
        );

        // WHEN
        actualNode.find(".sbte-text-with-error").simulate("click");
        actualNode.setProps({ spellCheckerMatchingOffset: spellCheckerMatchingOffset });

        // THEN
        expect(actualNode.find(Overlay).at(0).props().placement).toEqual("top");
    });

    it("renders popup on bottom when there is enough space for in the window", () => {
        // GIVEN
        // @ts-ignore
        // noinspection JSConstantReassignment
        window.innerHeight = 1000;
        const actualNode = mount(
            <SpellCheckIssue
                trackId={trackId}
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
        );

        // WHEN
        actualNode.find(".sbte-text-with-error").simulate("click");

        // THEN
        expect(actualNode.find(Overlay).at(0).props().placement).toEqual("bottom");
    });
});
