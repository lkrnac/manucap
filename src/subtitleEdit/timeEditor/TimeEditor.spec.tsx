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
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-minutes"
                        type="text"
                        className="sbte-time-editor-input"
                        value="000"
                        onChange={(): void => {}}
                    />
                </div>
                <label style={{ verticalAlign: "bottom", padding: "5px" }}>:</label>
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-seconds"
                        type="text"
                        className="sbte-time-editor-input"
                        style={{ width: "30px" }}
                        value="00"
                        onChange={(): void => {}}
                    />
                </div>
                <label style={{ verticalAlign: "bottom", padding: "5px" }}>.</label>
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-millis"
                        type="text"
                        className="sbte-time-editor-input"
                        value="000"
                        onChange={(): void => {}}
                    />
                </div>
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
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-minutes"
                        type="text"
                        className="sbte-time-editor-input"
                        value="000"
                        onChange={(): void => {}}
                    />
                </div>
                <label style={{ verticalAlign: "bottom", padding: "5px" }}>:</label>
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-seconds"
                        type="text"
                        className="sbte-time-editor-input"
                        style={{ width: "30px" }}
                        value="01"
                        onChange={(): void => {}}
                    />
                </div>
                <label style={{ verticalAlign: "bottom", padding: "5px" }}>.</label>
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-millis"
                        type="text"
                        className="sbte-time-editor-input"
                        value="000"
                        onChange={(): void => {}}
                    />
                </div>
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
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-minutes"
                        type="text"
                        className="sbte-time-editor-input"
                        value="005"
                        onChange={(): void => {}}
                    />
                </div>
                <label style={{ verticalAlign: "bottom", padding: "5px" }}>:</label>
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-seconds"
                        type="text"
                        className="sbte-time-editor-input"
                        style={{ width: "30px" }}
                        value="00"
                        onChange={(): void => {}}
                    />
                </div>
                <label style={{ verticalAlign: "bottom", padding: "5px" }}>.</label>
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-millis"
                        type="text"
                        className="sbte-time-editor-input"
                        value="000"
                        onChange={(): void => {}}
                    />
                </div>
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
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-minutes"
                        type="text"
                        className="sbte-time-editor-input"
                        value="120"
                        onChange={(): void => {}}
                    />
                </div>
                <label style={{ verticalAlign: "bottom", padding: "5px" }}>:</label>
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-seconds"
                        type="text"
                        className="sbte-time-editor-input"
                        style={{ width: "30px" }}
                        value="35"
                        onChange={(): void => {}}
                    />
                </div>
                <label style={{ verticalAlign: "bottom", padding: "5px" }}>.</label>
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-millis"
                        type="text"
                        className="sbte-time-editor-input"
                        value="976"
                        onChange={(): void => {}}
                    />
                </div>
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
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-minutes"
                        type="text"
                        className="sbte-time-editor-input"
                        value="999"
                        onChange={(): void => {}}
                    />
                </div>
                <label style={{ verticalAlign: "bottom", padding: "5px" }}>:</label>
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-seconds"
                        type="text"
                        className="sbte-time-editor-input"
                        style={{ width: "30px" }}
                        value="59"
                        onChange={(): void => {}}
                    />
                </div>
                <label style={{ verticalAlign: "bottom", padding: "5px" }}>.</label>
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-millis"
                        type="text"
                        className="sbte-time-editor-input"
                        value="999"
                        onChange={(): void => {}}
                    />
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor id="test" time={9999999} onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders max values for minutes and seconds but not millis", () => {
        // GIVEN
        const expectedNode = mount(
            <div id="test" style={{ display: "flex" }} className="sbte-time-editor">
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-minutes"
                        type="text"
                        className="sbte-time-editor-input"
                        value="999"
                        onChange={(): void => {}}
                    />
                </div>
                <label style={{ verticalAlign: "bottom", padding: "5px" }}>:</label>
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-seconds"
                        type="text"
                        className="sbte-time-editor-input"
                        style={{ width: "30px" }}
                        value="59"
                        onChange={(): void => {}}
                    />
                </div>
                <label style={{ verticalAlign: "bottom", padding: "5px" }}>.</label>
                <div style={{ flexFlow: "column" }}>
                    <input
                        id="test-millis"
                        type="text"
                        className="sbte-time-editor-input"
                        value="025"
                        onChange={(): void => {}}
                    />
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <TimeEditor id="test" time={59999.025} onChange={jest.fn()} />
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
        actualNode.find("#test-minutes").simulate("change", { target: { value: "abc!e@#.$%^" }});
        actualNode.find("#test-seconds").simulate("change", { target: { value: "abc!e@#.$%^" }});
        actualNode.find("#test-millis").simulate("change", { target: { value: "abc!e@#.$%^" }});

        // THEN
        expect(actualNode.find("#test-minutes").props().value).toEqual("000");
        expect(actualNode.find("#test-seconds").props().value).toEqual("00");
        expect(actualNode.find("#test-millis").props().value).toEqual("000");
    });

    it("maxes out minutes value", () => {
        // GIVEN
        const onChange = sinon.spy();
        const actualNode = mount(
            <TimeEditor id="test" onChange={onChange} />
        );

        // WHEN
        actualNode.find("#test-minutes").simulate("change", { target: { value: "60000" }});

        // THEN
        sinon.assert.calledWith(onChange, 59940);
        sinon.assert.calledOnce(onChange);
    });

    it("overflows seconds to minutes", () => {
        // GIVEN
        const onChange = sinon.spy();
        const actualNode = mount(
            <TimeEditor id="test" time={300} onChange={onChange} />
        );

        // WHEN
        actualNode.find("#test-seconds").simulate("change", { target: { value: "80" }});

        // THEN
        sinon.assert.calledWith(onChange, 380);
        sinon.assert.calledOnce(onChange);
    });

    it("overflows max seconds value", () => {
        // GIVEN
        const onChange = sinon.spy();
        const actualNode = mount(
            <TimeEditor id="test" time={59940} onChange={onChange} />
        );

        // WHEN
        actualNode.find("#test-seconds").simulate("change", { target: { value: "60" }});

        // THEN
        sinon.assert.calledWith(onChange, 59999);
        sinon.assert.calledOnce(onChange);
    });

    it("overflows millis to seconds", () => {
        // GIVEN
        const onChange = sinon.spy();
        const actualNode = mount(
            <TimeEditor id="test" time={10} onChange={onChange} />
        );

        // WHEN
        actualNode.find("#test-millis").simulate("change", { target: { value: "1001" }});

        // THEN
        sinon.assert.calledWith(onChange, 11.001);
        sinon.assert.calledOnce(onChange);
    });

    it("overflows max millis value", () => {
        // GIVEN
        const onChange = sinon.spy();
        const actualNode = mount(
            <TimeEditor id="test" time={59} onChange={onChange} />
        );

        // WHEN
        actualNode.find("#test-millis").simulate("change", { target: { value: "2000" }});

        // THEN
        sinon.assert.calledWith(onChange, 59.999);
        sinon.assert.calledOnce(onChange);
    });

    it("doesn't change input value on focus", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditor id="test" onChange={jest.fn()} />
        );

        // WHEN
        actualNode.find("#test-minutes").simulate("focus");
        actualNode.find("#test-seconds").simulate("focus");
        actualNode.find("#test-millis").simulate("focus");

        // THEN
        expect(actualNode.find("#test-minutes").props().value).toEqual("000");
        expect(actualNode.find("#test-seconds").props().value).toEqual("00");
        expect(actualNode.find("#test-millis").props().value).toEqual("000");
    });

});
