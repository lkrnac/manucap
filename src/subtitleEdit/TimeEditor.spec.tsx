import "../testUtils/initBrowserEnvironment";
import React from "react";
import TimeEditor from "./TimeEditor";
import { mount } from "enzyme";

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
                        id="test-milliseconds"
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
            <TimeEditor id="test" />
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
                        id="test-milliseconds"
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
            <TimeEditor id="test" time={1} />
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
                        id="test-milliseconds"
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
            <TimeEditor id="test" time={300} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders 120 minutes 35 seconds and 976 milliseconds", () => {
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
                        id="test-milliseconds"
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
            <TimeEditor id="test" time={7235.976} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    // TODO: this one is broken, need to fix it
    // it("renders max values", () => {
    //     // GIVEN
    //     const expectedNode = enzyme.mount(
    //         <div id="test" style={{display: "flex"}} className="sbte-time-editor">
    //             <div style={{flexFlow: "column"}}>
    //                 <input id="test-minutes" type="text" className="sbte-time-editor-input" value="999"
    //                        onChange={(): void => {}}/>
    //             </div>
    //             <label style={{verticalAlign: "bottom", padding: "5px"}}>:</label>
    //             <div style={{flexFlow: "column"}}>
    //                 <input id="test-seconds" type="text" className="sbte-time-editor-input" style={{width: "30px"}} value="99"
    //                        onChange={(): void => {}}/>
    //             </div>
    //             <label style={{verticalAlign: "bottom", padding: "5px"}}>.</label>
    //             <div style={{flexFlow: "column"}}>
    //                 <input id="test-milliseconds" type="text" className="sbte-time-editor-input" value="999"
    //                        onChange={(): void => {}}/>
    //             </div>
    //         </div>
    //     );
    //
    //     // WHEN
    //     const actualNode = enzyme.mount(
    //         <TimeEditor id="test" time={9999999} />
    //     );
    //
    //     // THEN
    //     expect(actualNode.html()).toEqual(expectedNode.html());
    // });

    it("inputs ignores non numeric characters", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditor id="test" />
        );

        // WHEN
        actualNode.find("#test-minutes").simulate("blur", { target: { value: "abc!e@#.$%^" }});
        actualNode.find("#test-seconds").simulate("blur", { target: { value: "abc!e@#.$%^" }});
        actualNode.find("#test-milliseconds").simulate("blur", { target: { value: "abc!e@#.$%^" }});

        // THEN
        expect(actualNode.find("#test-minutes").props().value).toEqual("000");
        expect(actualNode.find("#test-seconds").props().value).toEqual("00");
        expect(actualNode.find("#test-milliseconds").props().value).toEqual("000");
    });

    it("inputs pad with 0s", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditor id="test" />
        );

        // WHEN
        actualNode.find("#test-minutes").simulate("blur", { target: { value: "1" }});
        actualNode.find("#test-seconds").simulate("blur", { target: { value: "2" }});
        actualNode.find("#test-milliseconds").simulate("blur", { target: { value: "33" }});

        // THEN
        expect(actualNode.find("#test-minutes").props().value).toEqual("001");
        expect(actualNode.find("#test-seconds").props().value).toEqual("02");
        expect(actualNode.find("#test-milliseconds").props().value).toEqual("033");
    });

    it("max minutes is 999", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditor id="test" />
        );

        // WHEN
        actualNode.find("#test-minutes").simulate("blur", { target: { value: "999999" }});

        // THEN
        expect(actualNode.find("#test-minutes").props().value).toEqual("999");
    });

    it("max seconds is 59", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditor id="test" />
        );

        // WHEN
        actualNode.find("#test-seconds").simulate("blur", { target: { value: "65" }});

        // THEN
        expect(actualNode.find("#test-seconds").props().value).toEqual("05");
    });

    it("max milliseconds is 999", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditor id="test" />
        );

        // WHEN
        actualNode.find("#test-milliseconds").simulate("blur", { target: { value: "1150" }});

        // THEN
        expect(actualNode.find("#test-milliseconds").props().value).toEqual("150");
    });

    it("seconds overflow to minutes", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditor id="test" time={300} />
        );

        // WHEN
        actualNode.find("#test-seconds").simulate("blur", { target: { value: "80" }});

        // THEN
        expect(actualNode.find("#test-minutes").props().value).toEqual("006");
        expect(actualNode.find("#test-seconds").props().value).toEqual("20");
        expect(actualNode.find("#test-milliseconds").props().value).toEqual("000");
    });

    it("milliseconds overflow to seconds", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditor id="test" time={10} />
        );

        // WHEN
        actualNode.find("#test-milliseconds").simulate("blur", { target: { value: "1001" }});

        // THEN
        expect(actualNode.find("#test-minutes").props().value).toEqual("000");
        expect(actualNode.find("#test-seconds").props().value).toEqual("11");
        expect(actualNode.find("#test-milliseconds").props().value).toEqual("001");
    });

    it("cascade overflow from milliseconds to minutes", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditor id="test" time={1259} />
        );

        // WHEN
        actualNode.find("#test-milliseconds").simulate("blur", { target: { value: "3563" }});

        // THEN
        expect(actualNode.find("#test-minutes").props().value).toEqual("021");
        expect(actualNode.find("#test-seconds").props().value).toEqual("02");
        expect(actualNode.find("#test-milliseconds").props().value).toEqual("563");
    });

    it("focus doesn't change the value", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditor id="test" />
        );

        // WHEN
        actualNode.find("#test-minutes").simulate("focus");
        actualNode.find("#test-seconds").simulate("focus");
        actualNode.find("#test-milliseconds").simulate("focus");

        // THEN
        expect(actualNode.find("#test-minutes").props().value).toEqual("000");
        expect(actualNode.find("#test-seconds").props().value).toEqual("00");
        expect(actualNode.find("#test-milliseconds").props().value).toEqual("000");
    });

    it("change changes the value", () => {
        // GIVEN
        const actualNode = mount(
            <TimeEditor id="test" />
        );

        // WHEN
        actualNode.find("#test-minutes").simulate("change", { target: { value: "001" }});
        actualNode.find("#test-seconds").simulate("change", { target: { value: "20" }});
        actualNode.find("#test-milliseconds").simulate("change", { target: { value: "987" }});

        // THEN
        expect(actualNode.find("#test-minutes").props().value).toEqual("001");
        expect(actualNode.find("#test-seconds").props().value).toEqual("20");
        expect(actualNode.find("#test-milliseconds").props().value).toEqual("987");
    });
});
