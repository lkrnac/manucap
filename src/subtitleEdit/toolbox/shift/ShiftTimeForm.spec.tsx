import "../../../testUtils/initBrowserEnvironment";
import { Provider } from "react-redux";
import React from "react";
import ShiftTimesForm from "./ShiftTimeForm";
import { mount } from "enzyme";
import sinon from "sinon";
import testingStore from "../../../testUtils/testingStore";

describe("ShiftTimesForm", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="form-group">
                    <label>Time Shift in Seconds.Milliseconds</label>
                    <input
                        name="shift"
                        className="form-control dotsub-track-line-shift margin-right-10 mousetrap"
                        style={{ width: "120px" }}
                        type="number"
                        placeholder="0.000"
                        step="0.100"
                    />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesForm time={0} onChange={(): void => undefined} />
            </Provider>
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

    it("Calls on change when input changes", () => {
        // GIVEN
        const onChangeSpy = sinon.spy();
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesForm time={0} onChange={onChangeSpy} />
            </Provider>
        );

        // WHEN
        actualNode.find("input[type='number']").simulate("change", { target: { value: -1 }});

        // THEN
        sinon.assert.calledOnce(onChangeSpy);
    });
});

