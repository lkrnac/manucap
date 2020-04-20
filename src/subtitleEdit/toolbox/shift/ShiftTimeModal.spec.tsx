import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { applyShiftTime, updateCues } from "../../cues/cueSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { CueDto } from "../../model";
import { Provider } from "react-redux";
import React from "react";
import ShiftTimesModal from "./ShiftTimeModal";
import { mount } from "enzyme";
import sinon from "sinon";
import testingStore from "../../../testUtils/testingStore";
import { setSaveTrack } from "../../trackSlices";

const testCues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

describe("ShiftTimesModal", () => {
    it("renders with error message", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="fade modal-backdrop show" />
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fade modal show"
                    tabIndex={-1}
                    style={{ display: "block" }}
                >
                    <div role="document" className="modal-dialog sbte-medium-modal modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title h4">Shift All Track Lines Time</div >
                                <button type="button" className="close">
                                    <span aria-hidden="true">×</span >
                                    <span className="sr-only">Close</span >
                                </button >
                            </div >
                            <form>
                                <div className="modal-body">
                                    <div className="form-group"><label >Time Shift in Seconds.Milliseconds</label >
                                        <input
                                            name="shift"
                                            type="number"
                                            className="form-control dotsub-track-line-shift margin-right-10"
                                            style={{ width: "120px" }}
                                            placeholder="0.000"
                                            step="0.100"
                                            value=""
                                            onChange={jest.fn()}
                                        />
                                    </div >
                                </div >
                                <div className="modal-footer">
                                    <button
                                        type="submit"
                                        className="dotsub-shift-modal-apply-button btn btn-primary"
                                    >Apply
                                    </button >
                                    <button
                                        type="button"
                                        className="dotsub-shift-modal-close-button btn btn-secondary"
                                    >Close
                                    </button >
                                </div>
                            </form>
                        </div >
                    </div >
                </div >
            </Provider >
        );

        // WHEN
        testingStore.dispatch(applyShiftTime(1.1 as number) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={(): void => undefined} />
            </Provider >
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

    const expectedNodeWithErrorMsg = mount(
        <Provider store={testingStore}>
            <div className="fade modal-backdrop show" />
            <div role="dialog" aria-modal="true" className="fade modal show" tabIndex={-1} style={{ display: "block" }}>
                <div role="document" className="modal-dialog sbte-medium-modal modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title h4">Shift All Track Lines Time</div >
                            <button type="button" className="close">
                                <span aria-hidden="true">×</span >
                                <span className="sr-only">Close</span >
                            </button >
                        </div >
                        <form>
                            <div className="modal-body">
                                <div className="form-group"><label >Time Shift in Seconds.Milliseconds</label >
                                    <input
                                        name="shift"
                                        type="number"
                                        className="form-control dotsub-track-line-shift margin-right-10"
                                        style={{ width: "120px" }}
                                        placeholder="0.000"
                                        step="0.100"
                                        value="-1.000"
                                        onChange={jest.fn()}
                                    />
                                </div >
                                <span className="alert alert-danger" style={{ display: "block" }}>
                                    The start time of the first cue plus the shift value must be greater or equal to 0
                                </span >
                            </div >
                            <div className="modal-footer">
                                <button
                                    type="submit"
                                    className="dotsub-shift-modal-apply-button btn btn-primary"
                                    disabled
                                >
                                    Apply
                                </button >
                                <button
                                    type="button"
                                    className="dotsub-shift-modal-close-button btn btn-secondary"
                                >
                                    Close
                                </button >
                            </div>
                        </form>
                    </div >
                </div >
            </div >
        </Provider >
    );

    it("renders error message and disable apply button if shift is not valid", () => {
        // GIVEN
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={(): void => undefined} />
            </Provider >
        );
        actualNode.find("input[type='number']").simulate("change", { target: { value: -1 }});

        // THEN
        expect(actualNode.html()).toEqual(expectedNodeWithErrorMsg.html());
    });

    it("Applies the shift time on form submit with a valid shift value", () => {
        // // GIVEN
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider >
        );

        // WHEN
        actualNode.find("input[type='number']").simulate("change", { target: { value: 1 }});
        actualNode.find("form").simulate("submit");

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
    });

    it("Calls cancel when click apply", () => {
        // GIVEN
        const onClose = sinon.spy();
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={onClose} />
            </Provider >
        );

        // WHEN
        actualNode.find(".btn.btn-secondary").simulate("click");

        // THEN
        sinon.assert.called(onClose);
    });

    it("calls saveTrack in redux store when shift value", () => {
        // // GIVEN
        const mockSave = jest.fn();
        testingStore.dispatch(setSaveTrack(mockSave) as {} as AnyAction);
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider >
        );

        // WHEN
        actualNode.find("input[type='number']").simulate("change", { target: { value: 1 }});
        actualNode.find("form").simulate("submit");

        // THEN
        setTimeout(() => {
            expect(mockSave).toBeCalled();
        }, 600);
    });
});
