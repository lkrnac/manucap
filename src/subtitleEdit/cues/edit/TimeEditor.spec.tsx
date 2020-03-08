import "../../../testUtils/initBrowserEnvironment";
import React from "react";
import TimeEditor from "./TimeEditor";
import { mount } from "enzyme";
import sinon from "sinon";

describe("TimeEditor", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                type="text"
                className="sbte-time-input mousetrap"
                style={{
                    marginBottom: "5px",
                    width: "110px",
                    maxWidth: "200px",
                    padding: "5px",
                    textAlign: "center"
                }}
                value="00:00:00.000"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders 1 second", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                type="text"
                className="sbte-time-input mousetrap"
                style={{
                    marginBottom: "5px",
                    width: "110px",
                    maxWidth: "200px",
                    padding: "5px",
                    textAlign: "center"
                }}
                value="00:00:01.000"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor time={1} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders 5 minutes", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                type="text"
                className="sbte-time-input mousetrap"
                style={{
                    marginBottom: "5px",
                    width: "110px",
                    maxWidth: "200px",
                    padding: "5px",
                    textAlign: "center"
                }}
                value="00:05:00.000"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor time={300} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders 120 minutes 35 seconds and 976 millis", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                type="text"
                className="sbte-time-input mousetrap"
                style={{
                    marginBottom: "5px",
                    width: "110px",
                    maxWidth: "200px",
                    padding: "5px",
                    textAlign: "center"
                }}
                value="02:00:35.976"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor time={7235.976} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders max values", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                type="text"
                className="sbte-time-input mousetrap"
                style={{
                    marginBottom: "5px",
                    width: "110px",
                    maxWidth: "200px",
                    padding: "5px",
                    textAlign: "center"
                }}
                value="99:59:59.999"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor time={359999.999} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders max values for minutes and seconds but not hours and millis", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                type="text"
                className="sbte-time-input mousetrap"
                style={{
                    marginBottom: "5px",
                    width: "110px",
                    maxWidth: "200px",
                    padding: "5px",
                    textAlign: "center"
                }}
                value="01:59:59.025"
                onChange={(): void => undefined}
            />
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor time={7199.025} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("inputs ignores non numeric characters", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditor onChange={jest.fn()} />
        );

        // WHEN
        actualNode.find("TimeField").simulate("change", { target: { value: "abc!e@#.$%^" }});

        // THEN
        expect(actualNode.find("TimeField").props().value).toEqual("00:00:00.000");
    });

    it("call onChange with correct value", () => {
        // GIVEN
        const onChange = sinon.spy();
        const actualNode = mount(
            <TimeEditor onChange={onChange} />
        );

        // WHEN
        actualNode.find("TimeField").simulate("change", { target: { value: "60:00:00.000", selectionEnd: 12 }});

        // THEN
        sinon.assert.calledWith(onChange, 216000);
        sinon.assert.calledOnce(onChange);
    });

    it("prevents value from changing to a value greater than maxValue", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                type="text"
                className="sbte-time-input mousetrap"
                style={{
                    marginBottom: "5px",
                    width: "110px",
                    maxWidth: "200px",
                    padding: "5px",
                    textAlign: "center"
                }}
                value="01:59:59.025"
                onChange={(): void => undefined}
            />
        );
        const onChange = sinon.spy();
        const actualNode = mount(
            <TimeEditor time={7199.025} maxTime={7200} onChange={onChange} />
        );

        // WHEN
        actualNode.find("TimeField").simulate("change", { target: { value: "03:00:00.000", selectionEnd: 12 }});

        // THEN
        sinon.assert.calledWith(onChange, 7199.025);
        sinon.assert.calledOnce(onChange);
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("prevents value from changing to a value less than minValue", () => {
        // GIVEN
        const expectedNode = mount(
            <input
                type="text"
                className="sbte-time-input mousetrap"
                style={{
                    marginBottom: "5px",
                    width: "110px",
                    maxWidth: "200px",
                    padding: "5px",
                    textAlign: "center"
                }}
                value="00:01:00.200"
                onChange={(): void => undefined}
            />
        );
        const onChange = sinon.spy();
        const actualNode = mount(
            <TimeEditor time={60.200} minTime={50} onChange={onChange} />
        );

        // WHEN
        actualNode.find("TimeField").simulate("change", { target: { value: "00:00:05.000", selectionEnd: 12 }});

        // THEN
        sinon.assert.calledWith(onChange, 60.2);
        sinon.assert.calledOnce(onChange);
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

});
