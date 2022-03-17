import { fireEvent, render } from "@testing-library/react";
import { removeHeadlessAttributes } from "../../testUtils/testUtils";
import Tooltip from "./Tooltip";

describe("Tooltip", () => {
    it("renders without tooltip", () => {
        // GIVEN
        const actualNode = render(
            <Tooltip message="Test message">
                <span>Testing</span>
            </Tooltip>
        );

        // WHEN
        const expectedNode = render(
            <div id="" aria-expanded="false">
                <span>Testing</span>
            </div>
        );

        // THEN
        const actual = removeHeadlessAttributes(actualNode.container.outerHTML);
        expect(actual).toBe(expectedNode.container.outerHTML);
    });

    it("renders with tooltip on mouseover", () => {
        // GIVEN
        const actualNode = render(
            <Tooltip message="Test message">
                <span>Testing</span>
            </Tooltip>
        );

        const expectedNode = render(
            <>
                <div
                    id=""
                    aria-expanded="false"
                    aria-controls=""
                >
                    <span>Testing</span>
                </div>
                <div
                    style={{ position: "absolute", left: 0, top: 0 }}
                    className="tw-z-40 tw-popper-wrapper"
                    id=""
                >
                    <div
                        className="tw-transition-opacity tw-duration-300 tw-pointer-events-none
                            tw-ease-in-out tw-opacity-0"
                    >
                        <div className="tw-tooltip tw-arrow before:tw-border-b-blue-grey-700">
                            Test message
                        </div>
                    </div>
                </div>
            </>
        );

        // WHEN
        fireEvent.mouseOver(actualNode.container.querySelector("span") as Element);

        // THEN
        const actual = removeHeadlessAttributes(actualNode.container.outerHTML);
        expect(actual).toBe(expectedNode.container.outerHTML);
    });

    it("renders with custom toggleClassName", () => {
        // GIVEN
        const actualNode = render(
            <Tooltip
                message="Test message"
                toggleClassName="toggle-test-class"
            >
                <span>Testing</span>
            </Tooltip>
        );

        const expectedNode = render(
            <>
                <div
                    className="toggle-test-class"
                    id=""
                    aria-expanded="false"
                    aria-controls=""
                >
                    <span>Testing</span>
                </div>
                <div
                    style={{ position: "absolute", left: 0, top: 0 }}
                    className="tw-z-40 tw-popper-wrapper"
                    id=""
                >
                    <div
                        className="tw-transition-opacity tw-duration-300
                            tw-pointer-events-none tw-ease-in-out tw-opacity-0"
                    >
                        <div className="tw-tooltip tw-arrow before:tw-border-b-blue-grey-700">
                            Test message
                        </div>
                    </div>
                </div>
            </>
        );

        // WHEN
        fireEvent.mouseOver(actualNode.container.querySelector("span") as Element);

        // THEN
        const actual = removeHeadlessAttributes(actualNode.container.outerHTML);
        expect(actual).toBe(expectedNode.container.outerHTML);
    });

    it("does not show tooltip in disabled state when mouse over happens", () => {
        // GIVEN
        const actualNode = render(
            <Tooltip
                disabled
                message="Test message"
            >
                <span>Testing</span>
            </Tooltip>
        );

        const expectedNode = render(
            <>
                <div id="" aria-expanded="false">
                    <span>Testing</span>
                </div>
            </>
        );

        // WHEN
        fireEvent.mouseOver(actualNode.container.querySelector("span") as Element);

        // THEN
        const actual = removeHeadlessAttributes(actualNode.container.outerHTML);
        expect(actual).toBe(expectedNode.container.outerHTML);
    });

    it("closes tooltip on mouse leave", () => {
        // GIVEN
        const actualNode = render(
            <Tooltip message="Test message">
                <span>Testing</span>
            </Tooltip>
        );

        const expectedNode = render(
            <div id="" aria-expanded="false">
                <span>Testing</span>
            </div>
        );

        // WHEN
        fireEvent.mouseOver(actualNode.container.querySelector("span") as Element);
        fireEvent.mouseLeave(actualNode.container.querySelector("span") as Element);

        // THEN
        const actual = removeHeadlessAttributes(actualNode.container.outerHTML);
        expect(actual).toBe(expectedNode.container.outerHTML);
    });
});
