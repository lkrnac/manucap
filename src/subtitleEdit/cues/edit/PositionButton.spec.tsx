import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue type
import { Position } from "../cueUtils";
import PositionButton from "./PositionButton";
import { mount } from "enzyme";
import { removeHeadlessAttributes } from "../../../testUtils/testUtils";

describe("PositionButton", () => {
    it("renders button", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        const expectedNode = mount(
            <div className="md:tw-relative tw-dropdown-wrapper tw-pb-[5px] tw-pr-[10px]">
                <div
                    id=""
                    aria-expanded={false}
                >
                    <div
                        className="tw-cursor-pointer"
                        id=""
                        aria-haspopup
                        aria-expanded={false}
                    >
                        <button
                            className="tw-select-none dropdown-toggle btn
                                btn-outline-secondary tw-w-[68px] tw-open-false"
                        >
                            ↓↓<span className="caret" />
                        </button>
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(<PositionButton vttCue={vttCue} changePosition={(): void => undefined} />);

        // THEN
        const actual = removeHeadlessAttributes(actualNode.html());
        const expected = removeHeadlessAttributes(expectedNode.html());
        expect(actual).toEqual(expected);
    });

    it("renders with dropdown", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        // noinspection HtmlUnknownAttribute
        const expectedNode = mount(
            <div className="md:tw-relative tw-dropdown-wrapper tw-pb-[5px] tw-pr-[10px]">
                <div
                    id=""
                    aria-expanded={false}
                >
                    <div
                        className="tw-cursor-pointer"
                        id=""
                        aria-haspopup
                        aria-expanded
                        aria-controls=""
                    >
                        <button
                            className="tw-select-none dropdown-toggle btn
                                btn-outline-secondary tw-w-[68px] tw-open-true focus active"
                        >
                            ↓↓<span className="caret" />
                        </button>
                    </div>
                </div>
                <div
                    className="tw-transition-all tw-duration-300 tw-ease-in-out
                        tw-origin-top-left tw-opacity-0 tw-scale-75"
                >
                    <div className="tw-absolute tw-left-0 tw-min-w-[210px] tw-w-[210px]">
                        <ul
                            className="tw-dropdown-menu tw-transition-all tw-flex tw-flex-row tw-flex-wrap"
                            aria-labelledby=""
                            id=""
                            role="menu"
                        >
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 6px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↖↖
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 9px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↖↑
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 13px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↑↑
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 11px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↑↗
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 6px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↗↗
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 6px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↖←
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 13px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↖
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 16px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↑
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 13px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↗
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 6px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    →↗
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 5px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ←←
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 12px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ←
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 16px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    •
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 12px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    →
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 5px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    →→
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 6px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↙←
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 13px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↙
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 16px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↓
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 13px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↘
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 6px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    →↘
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 6px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↙↙
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 9px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↙↓
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 13px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↓↓
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 11px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↓↘
                                </div>
                            </li>
                            <li
                                id=""
                                role="menuitem"
                            >
                                <div
                                    className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                    style={{
                                        lineHeight: "38px",
                                        width: "38px",
                                        margin: "auto",
                                        padding: "0px 0px 0px 6px",
                                        borderRadius: "3px"
                                    }}
                                >
                                    ↘↘
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(<PositionButton vttCue={vttCue} changePosition={(): void => undefined} />);
        actualNode.find("button").simulate("click");

        // THEN
        const actual = removeHeadlessAttributes(actualNode.html());
        const expected = removeHeadlessAttributes(expectedNode.html());
        expect(actual).toEqual(expected);
    });

    it("changes position", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        const changePosition = jest.fn();

        // WHEN
        const actualNode = mount(<PositionButton vttCue={vttCue} changePosition={changePosition} />);
        actualNode.find("button").simulate("click");
        actualNode.find("li").at(3).simulate("click");

        // THEN
        expect(changePosition).toBeCalledWith(Position.Row1Column4);
    });

    it("initializes icon on button according to vttCue styles", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        vttCue.line = 4;
        vttCue.align = "start";
        vttCue.positionAlign = "center";
        vttCue.position = 65;

        // WHEN
        const actualNode = mount(<PositionButton vttCue={vttCue} changePosition={(): void => undefined} />);

        // THEN
        expect(actualNode.find(".dropdown-toggle").text()).toEqual("↖");
    });
});
