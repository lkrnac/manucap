import "../../testUtils/initBrowserEnvironment";
import React from "react";
import TimeEditor from "./TimeEditor";
import { mount } from "enzyme";
import sinon from "sinon";

describe("TimeEditor", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <div id="test" style={{ display: "flex" }} className="sbte-time-editor">
                <input
                    type="text"
                    value="00:00:00.000"
                    className="sbte-time-input"
                    onChange={(): void => {}}
                />
            </div>
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor id="test" onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders 1 second", () => {
        // GIVEN
        const expectedNode = mount(
            <div id="test" style={{ display: "flex" }} className="sbte-time-editor">
                <input
                    type="text"
                    value="00:00:01.000"
                    className="sbte-time-input"
                    onChange={(): void => {}}
                />
            </div>
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor id="test" time={1} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders 5 minutes", () => {
        // GIVEN
        const expectedNode = mount(
            <div id="test" style={{ display: "flex" }} className="sbte-time-editor">
                <input
                    type="text"
                    value="00:05:00.000"
                    className="sbte-time-input"
                    onChange={(): void => {}}
                />
            </div>
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor id="test" time={300} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders 120 minutes 35 seconds and 976 millis", () => {
        // GIVEN
        const expectedNode = mount(
            <div id="test" style={{ display: "flex" }} className="sbte-time-editor">
                <input
                    type="text"
                    value="02:00:35.976"
                    className="sbte-time-input"
                    onChange={(): void => {}}
                />
            </div>
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor id="test" time={7235.976} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders max values", () => {
        // GIVEN
        const expectedNode = mount(
            <div id="test" style={{ display: "flex" }} className="sbte-time-editor">
                <input
                    type="text"
                    value="99:59:59.999"
                    className="sbte-time-input"
                    onChange={(): void => {}}
                />
            </div>
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor id="test" time={359999.999} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders max values for minutes and seconds but not hours and millis", () => {
        // GIVEN
        const expectedNode = mount(
            <div id="test" style={{ display: "flex" }} className="sbte-time-editor">
                <input
                    type="text"
                    value="01:59:59.025"
                    className="sbte-time-input"
                    onChange={(): void => {}}
                />
            </div>
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor id="test" time={7199.025} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("inputs ignores non numeric characters", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditor id="test" onChange={jest.fn()} />
        );

        // WHEN
        actualNode.find("#test input").simulate("change", { target: { value: "abc!e@#.$%^" }});

        // THEN
        expect(actualNode.find("#test input").props().value).toEqual("00:00:00.000");
    });

    it("call onChange with correct value", () => {
        // GIVEN
        const onChange = sinon.spy();
        const actualNode = mount(
            <TimeEditor id="test" onChange={onChange} />
        );

        // WHEN
        actualNode.find("TimeField").simulate("change", { target: { value: "60:00:00.000", selectionEnd: 12 }});

        // THEN
        sinon.assert.calledWith(onChange, 216000);
        sinon.assert.calledOnce(onChange);
    });

});
