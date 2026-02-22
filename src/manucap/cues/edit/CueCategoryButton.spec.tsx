import "../../../testUtils/initBrowserEnvironment";

import each from "jest-each";
import { fireEvent, render } from "@testing-library/react";

import CueCategoryButton from "./CueCategoryButton";

describe("CueCategoryButton", () => {
    it("renders button for undefined category", () => {
        // GIVEN
        const expectedNode = render(
            <button
                className="mc-dropdown-toggle mc-btn mc-btn-light !font-normal"
                aria-controls="cueCategoryMenu"
                aria-haspopup="true"
            >
                Dialogue
            </button>
        );

        // WHEN
        const actualNode = render(
            <CueCategoryButton onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders button for already defined category", () => {
        // GIVEN
        const expectedNode = render(
            <button
                className="mc-dropdown-toggle mc-btn mc-btn-light !font-normal"
                aria-controls="cueCategoryMenu"
                aria-haspopup="true"
            >
                Audio Descriptions
            </button>
        );

        // WHEN
        const actualNode = render(
            <CueCategoryButton onChange={jest.fn()} category={"AUDIO_DESCRIPTION"} />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders with dropdown", () => {
        // GIVEN
        const expectedNode = render(
            <>
                <button
                    className="mc-dropdown-toggle mc-btn mc-btn-light"
                    aria-controls="cueCategoryMenu"
                    aria-haspopup="true"
                >
                    Dialogue
                </button>
                <div
                    id="cueCategoryMenu"
                    className="p-menu p-component p-menu-overlay p-connected-overlay-enter
                        p-connected-overlay-enter-active"
                    style={{
                        zIndex: 1001,
                        visibility: "visible",
                        display: "none",
                        transformOrigin: "top",
                        top: 0,
                        left: 0
                    }}
                >
                    <ul className="p-menu-list p-reset" role="menu">
                        <li className="p-menuitem" role="none"><span>Dialogue</span></li>
                        <li className="p-menuitem" role="none"><span>On Screen Text</span></li>
                        <li className="p-menuitem" role="none"><span>Audio Descriptions</span></li>
                        <li className="p-menuitem" role="none"><span>Lyrics</span></li>
                    </ul>
                </div>
            </>
        );

        // WHEN
        const actualNode = render(<CueCategoryButton onChange={jest.fn()} />);
        fireEvent.click(actualNode.container.querySelector("button") as Element);

        // THEN
        expect(document.body.innerHTML).toContain(expectedNode.container.outerHTML);
    });

    describe("CueCategory options", () => {
        // GIVEN
        const onChange = jest.fn();

        each([
            [0, "DIALOGUE"],
            [1, "ONSCREEN_TEXT"],
            [2, "AUDIO_DESCRIPTION"],
            [3, "LYRICS"],
        ])
            .it("call onChange with correct value", (
                index: number,
                expectedValue: string
            ) => {
                // WHEN
                const actualNode = render(<CueCategoryButton onChange={onChange} />);
                const button = actualNode.container.querySelector("button")!;
                fireEvent.click(button);
                const span = document.querySelectorAll("#cueCategoryMenu li")[index].querySelector("span")!;
                fireEvent.click(span);

                // THEN
                expect(onChange).toHaveBeenCalledWith(expectedValue);
            });
    });
});
