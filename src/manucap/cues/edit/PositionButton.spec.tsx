import "../../../testUtils/initBrowserEnvironment";

import "video.js"; // VTTCue type
import { fireEvent, render } from "@testing-library/react";

import { Position } from "../cueUtils";
import PositionButton from "./PositionButton";
import { removeNewlines } from "../../../testUtils/testUtils";

describe("PositionButton", () => {
    it("renders button", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        const expectedNode = render(
            <button
                className="mc-position-toggle-button mc-dropdown-toggle mc-btn mc-btn-light"
                aria-controls="positionButtonMenu"
                aria-haspopup="true"
            >
                <span>↓↓</span>
                <span className="caret" />
            </button>
        );

        // WHEN
        const actualNode = render(<PositionButton vttCue={vttCue} changePosition={(): void => undefined} />);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders with dropdown", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        // noinspection HtmlUnknownAttribute
        const expectedNode = render(
            <>
                <button
                    className="mc-position-toggle-button mc-dropdown-toggle mc-btn mc-btn-light"
                    aria-controls="positionButtonMenu"
                    aria-haspopup="true"
                >
                    <span>↓↓</span>
                    <span className="caret" />
                </button>
                <div
                    id="positionButtonMenu"
                    className="p-menu p-component p-menu-overlay mc-position-button-list
                        p-connected-overlay-enter p-connected-overlay-enter-active"
                    style={{
                        zIndex: 1001,
                        visibility: "visible",
                        display: "none",
                        transformOrigin: "top",
                        top: 0,
                        left: 0
                    }}
                >
                    <ul
                        className="p-menu-list p-reset"
                        role="menu"
                    >
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↖↖
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↖↑
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option" >
                                ↑↑
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↑↗
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↗↗
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↖←
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↖
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↑
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↗
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                →↗
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ←←
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ←
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                •
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                →
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                →→
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↙←
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↙
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↓
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↘
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                →↘
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↙↙
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↙↓
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↓↓
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↓↘
                            </span>
                        </li>
                        <li className="p-menuitem" role="none">
                            <span className="mc-position-button-option">
                                ↘↘
                            </span>
                        </li>
                    </ul>
                </div>
            </>
        );

        // WHEN
        const actualNode = render(<PositionButton vttCue={vttCue} changePosition={jest.fn()} />);
        fireEvent.click(actualNode.container.querySelector("button")!);

        // THEN
        expect(removeNewlines(document.body.children[0].innerHTML)).toEqual(removeNewlines(expectedNode.container.innerHTML));
    });

    it("changes position", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        const changePosition = jest.fn();

        // WHEN
        const actualNode = render(<PositionButton vttCue={vttCue} changePosition={changePosition} />);
        const button = actualNode.container.querySelector("button");
        fireEvent.click(button!);
        const row1Column4Button = document.body.querySelectorAll("li")[3].querySelector("span");
        fireEvent.click(row1Column4Button!);

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
        const actualNode = render(<PositionButton vttCue={vttCue} changePosition={(): void => undefined} />);

        // THEN
        const buttonLabel = actualNode.container.querySelector(".mc-dropdown-toggle")?.textContent
        expect(buttonLabel).toEqual("↖");
    });
});
