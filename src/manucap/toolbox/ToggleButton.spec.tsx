import "../../testUtils/initBrowserEnvironment";

import { ReactElement } from "react";
import { fireEvent, render } from "@testing-library/react";

import ToggleButton from "./ToggleButton";

describe("ToggleButton", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="">
                Click me!
            </button>
        );

        // WHEN
        const actualNode = render(
            <ToggleButton
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders toggled", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="mc-btn-secondary outline-0 active">
                Click me!
            </button>
        );

        // WHEN
        const actualNode = render(
            <ToggleButton
                className="mc-btn-secondary"
                toggled
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders with class", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="mc-btn-secondary">
                Click me!
            </button>
        );

        // WHEN
        const actualNode = render(
            <ToggleButton
                className="mc-btn-secondary"
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders with title", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="" title="Testing title">
                Click me!
            </button>
        );

        // WHEN
        const actualNode = render(
            <ToggleButton
                title="Testing title"
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders disabled", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="mc-btn-secondary" disabled>
                Click me!
            </button>
        );

        // WHEN
        const actualNode = render(
            <ToggleButton
                className="mc-btn-secondary"
                disabled
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("calls onClick on click", () => {
        // GIVEN
        const mockOnClick = jest.fn();
        const actualNode = render(
            <ToggleButton
                onClick={mockOnClick}
                className="mc-btn-secondary"
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // WHEN
        const button = actualNode.container.querySelector("button")!;
        fireEvent.click(button);

        // THEN
        expect(mockOnClick).toBeCalled();
    });

    it("appends toggle class on toggle", () => {
        // GIVEN
        const mockOnClick = jest.fn();
        const actualNode = render(
            <ToggleButton
                onClick={mockOnClick}
                className="mc-btn-secondary"
                render={(): ReactElement => (
                    <>Click me!</>
                )}
            />
        );

        // WHEN
        const button = actualNode.container.querySelector("button")!;
        fireEvent.click(button);

        // THEN
        // const button = actualNode.container.querySelector("button")!;
        expect(button.classList.contains("mc-btn-secondary")).toBe(true);
        expect(button.classList.contains("outline-0")).toBe(true);
        expect(button.classList.contains("active")).toBe(true);
    });

    it("passes toggle state to render prop", () => {
        // GIVEN
        const actualNode = render(
            <ToggleButton
                render={(toggle): ReactElement => (
                    toggle
                        ? <span>ON</span>
                        : <span>OFF</span>
                )}
            />
        );

        // WHEN
        const button = actualNode.container.querySelector("button")!;
        fireEvent.click(button);

        // THEN
        expect(actualNode.container.querySelector("span")!.innerHTML).toEqual("ON");
    });

    it("passes toggle state back", () => {
        // GIVEN
        const actualNode = render(
            <ToggleButton
                render={(toggle): ReactElement => (
                    toggle
                        ? <span>ON</span>
                        : <span>OFF</span>
                )}
            />
        );

        // WHEN
        const button = actualNode.container.querySelector("button")!;
        fireEvent.click(button);
        fireEvent.click(button);

        // THEN
        expect(actualNode.container.querySelector("span")!.innerHTML).toEqual("OFF");
    });
});
