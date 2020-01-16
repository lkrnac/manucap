import "../../testUtils/initBrowserEnvironment";
import React from "react";
import TimeEditorMinutes from "./TimeEditorMinutes";
import { mount } from "enzyme";
import sinon from "sinon";

describe("TimeEditorMinutes", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                id="test-minutes"
                type="text"
                className="sbte-time-editor-input"
                value="000"
                onChange={(): void => {}}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditorMinutes id="test" time={0} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders max value", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                id="test-minutes"
                type="text"
                className="sbte-time-editor-input"
                value="999"
                onChange={(): void => {}}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditorMinutes id="test" time={60000} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("input ignores non numeric characters", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditorMinutes id="test" time={0} onChange={jest.fn()} />
        );

        // WHEN
        actualNode.find("#test-minutes").simulate("change", { target: { value: "abc!e@#.$%^" }});

        // THEN
        expect(actualNode.find("#test-minutes").props().value).toEqual("000");
    });

    it("maxes out value", () => {
        // GIVEN
        const onChange = sinon.spy();
        const actualNode = mount(
            <TimeEditorMinutes id="test" time={0} onChange={onChange} />
        );

        // WHEN
        actualNode.find("#test-minutes").simulate("change", { target: { value: "60000" }});

        // THEN
        sinon.assert.calledWith(onChange, 59940);
        sinon.assert.calledOnce(onChange);
    });

    it("doesn't change input value on focus", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditorMinutes id="test" time={0} onChange={jest.fn()} />
        );

        // WHEN
        actualNode.find("#test-minutes").simulate("focus");

        // THEN
        expect(actualNode.find("#test-minutes").props().value).toEqual("000");
    });

});
