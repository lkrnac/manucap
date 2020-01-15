import "../../testUtils/initBrowserEnvironment";
import React from "react";
import TimeEditorMillis from "./TimeEditorMillis";
import { mount } from "enzyme";
import sinon from "sinon";

describe("TimeEditorMillis", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                id="test-millis"
                type="text"
                className="sbte-time-editor-input"
                value="000"
                onChange={(): void => {}}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditorMillis id="test" time={0} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with value", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                id="test-millis"
                type="text"
                className="sbte-time-editor-input"
                value="578"
                onChange={(): void => {}}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditorMillis id="test" time={0.578} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("input ignores non numeric characters", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditorMillis id="test" time={0} onChange={jest.fn()} />
        );

        // WHEN
        actualNode.find("#test-millis").simulate("change", { target: { value: "abc!e@#.$%^" }});

        // THEN
        expect(actualNode.find("#test-millis").props().value).toEqual("000");
    });

    it("overflows value to seconds", () => {
        // GIVEN
        const onChange = sinon.spy();
        const actualNode = mount(
            <TimeEditorMillis id="test" time={0} onChange={onChange} />
        );

        // WHEN
        actualNode.find("#test-millis").simulate("change", { target: { value: "3999" }});

        // THEN
        sinon.assert.calledWith(onChange, 3.999);
        sinon.assert.calledOnce(onChange);
    });

    it("doesn't change input value on focus", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditorMillis id="test" time={0} onChange={jest.fn()} />
        );

        // WHEN
        actualNode.find("#test-millis").simulate("focus");

        // THEN
        expect(actualNode.find("#test-millis").props().value).toEqual("000");
    });

});
