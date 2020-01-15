import "../../testUtils/initBrowserEnvironment";
import React from "react";
import TimeEditorSeconds from "./TimeEditorSeconds";
import { mount } from "enzyme";
import sinon from "sinon";

describe("TimeEditorSeconds", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                id="test-seconds"
                type="text"
                className="sbte-time-editor-input"
                style={{ width: "30px" }}
                value="00"
                onChange={(): void => {}}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditorSeconds id="test" time={0} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders overflow value", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                id="test-seconds"
                type="text"
                className="sbte-time-editor-input"
                style={{ width: "30px" }}
                value="00"
                onChange={(): void => {}}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditorSeconds id="test" time={60} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("input ignores non numeric characters", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditorSeconds id="test" time={0} onChange={jest.fn()} />
        );

        // WHEN
        actualNode.find("#test-seconds").simulate("change", { target: { value: "abc!e@#.$%^" }});

        // THEN
        expect(actualNode.find("#test-seconds").props().value).toEqual("00");
    });

    it("overflows value to minutes", () => {
        // GIVEN
        const onChange = sinon.spy();
        const actualNode = mount(
            <TimeEditorSeconds id="test" time={0} onChange={onChange} />
        );

        // WHEN
        actualNode.find("#test-seconds").simulate("change", { target: { value: "60" }});

        // THEN
        sinon.assert.calledWith(onChange, 60);
        sinon.assert.calledOnce(onChange);
    });

    it("doesn't change input value on focus", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditorSeconds id="test" time={0} onChange={jest.fn()} />
        );

        // WHEN
        actualNode.find("#test-seconds").simulate("focus");

        // THEN
        expect(actualNode.find("#test-seconds").props().value).toEqual("00");
    });

});
