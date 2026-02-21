import "../../../testUtils/initBrowserEnvironment";

import { fireEvent, render } from "@testing-library/react";

import TimeEditor from "./TimeEditor";

describe("TimeEditor", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <input
                type="text"
                className="mc-form-control mousetrap block text-center"
                value="00:00:00.000"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = render(
            <TimeEditor onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders 1 second", () => {
        // GIVEN
        const expectedNode = render(
            <input
                type="text"
                className="mc-form-control mousetrap block text-center"
                value="00:00:01.000"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = render(
            <TimeEditor time={1} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders 5 minutes", () => {
        // GIVEN
        const expectedNode = render(
            <input
                type="text"
                className="mc-form-control mousetrap block text-center"
                value="00:05:00.000"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = render(
            <TimeEditor time={300} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders 120 minutes 35 seconds and 976 millis", () => {
        // GIVEN
        const expectedNode = render(
            <input
                type="text"
                className="mc-form-control mousetrap block text-center"
                value="02:00:35.976"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = render(
            <TimeEditor time={7235.976} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders max values", () => {
        // GIVEN
        const expectedNode = render(
            <input
                type="text"
                className="mc-form-control mousetrap block text-center"
                value="99:59:59.999"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = render(
            <TimeEditor time={359999.999} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders max values for minutes and seconds but not hours and millis", () => {
        // GIVEN
        const expectedNode = render(
            <input
                type="text"
                className="mc-form-control mousetrap block text-center"
                value="01:59:59.025"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = render(
            <TimeEditor time={7199.025} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("inputs ignores non numeric characters", () => {
        // GIVEN
        const onChange = jest.fn();
        const actualNode = render(
            <TimeEditor onChange={jest.fn()} />
        );

        // WHEN
        const timeField = actualNode.container.querySelector("input");
        fireEvent.change(timeField!, { target: { value: "abc!e@#.$%^" }});

        // THEN
        expect(onChange).toBeCalledTimes(0);
    });

    it("call onChange with correct value", () => {
        // GIVEN
        const onChange = jest.fn();
        const actualNode = render(
            <TimeEditor onChange={onChange} />
        );

        // WHEN
        const timeField = actualNode.container.querySelector("input");
        fireEvent.change(timeField!, { target: { value: "60:00:00.000", selectionEnd: 12 }});

        // THEN
        expect(onChange).toBeCalledWith(216000);
        expect(onChange).toBeCalledTimes(1);
    });
});
