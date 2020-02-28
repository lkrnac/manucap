import "../../../testUtils/initBrowserEnvironment";
import {Provider} from "react-redux";
import React from "react";
import {applyShiftTime, updateCues} from "../../trackSlices";
import ShiftTimesModal from "./ShiftTimeModal";
import {mount} from "enzyme";
import testingStore from "../../../testUtils/testingStore";
import "video.js"; // VTTCue definition
import * as trackSlices from "../../trackSlices";
import { dispatchFunctionTest } from "../../../testUtils/testUtils";
import { CueDto } from "./model";
import sinon from "sinon";

describe("ShiftTimesModal", () => {
    it("renders with error message", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="fade modal-backdrop show"></div>
                <div role="dialog" aria-modal="true" className="fade modal show" tabIndex="-1" style={{display: "block"}}>
                    <div role="document" className="modal-dialog sbte-medium-modal modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title h4">Shift All Track Lines Time</div>
                                <button type="button" className="close"><span aria-hidden="true">×</span><span
                                    className="sr-only">Close</span></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="form-group"><label>Time Shift in Seconds.Milliseconds</label>
                                        <input
                                        name="shift" className="form-control dotsub-track-line-shift margin-right-10"
                                        style={{width: "120px"}} type="number" placeholder="0.000" step="0.100"/>
                                    </div>
                                </form>
                                <span className="alert alert-danger" style={{display: "none"}}>Shift value is not valid (first track line time + shift) must be greater or equals 0.</span>
                            </div>
                            <div className="modal-footer">
                                <button type="button"
                                        className="dotsub-shift-modal-apply-button btn btn-primary">Apply
                                </button>
                                <button type="button"
                                        className="dotsub-shift-modal-close-button btn btn-secondary">Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(applyShiftTime(1.1 as number));
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={(): void => {}} />
            </Provider>
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });


    const expectedNodeWithErrorMsg = mount( <Provider store={testingStore}>
        <div className="fade modal-backdrop show"></div>
        <div role="dialog" aria-modal="true" className="fade modal show" tabIndex="-1" style={{display: "block"}}>
            <div role="document" className="modal-dialog sbte-medium-modal modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="modal-title h4">Shift All Track Lines Time</div>
                        <button type="button" className="close"><span aria-hidden="true">×</span><span
                            className="sr-only">Close</span></button>
                    </div>
                    <div className="modal-body">
                        <form>
                            <div className="form-group"><label>Time Shift in Seconds.Milliseconds</label>
                                <input
                                    name="shift" className="form-control dotsub-track-line-shift margin-right-10"
                                    style={{width: "120px"}} type="number" placeholder="0.000" step="0.100"/>
                            </div>
                        </form>
                        <span className="alert alert-danger" style={{display: "block"}}>Shift value is not valid (first track line time + shift) must be greater or equals 0.</span>
                    </div>
                    <div className="modal-footer">
                        <button type="button"
                                className="dotsub-shift-modal-apply-button btn btn-primary" disabled>Apply
                        </button>
                        <button type="button"
                                className="dotsub-shift-modal-close-button btn btn-secondary">Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Provider>);

    it("renders error message and disable apply button if shift is not valid", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        testingStore.dispatch(updateCues(cues));


        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}f>
                <ShiftTimesModal show onClose={(): void => {}} />
            </Provider>
        );
        actualNode.find("input[type='number']")
            .simulate('change', { target: { value: -1 } });


        // THEN
        expect(actualNode.html())
            .toEqual(expectedNodeWithErrorMsg.html());
    });



    it("Calls trackSlice.applyShiftTime when click apply", () => {
        // // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        testingStore.dispatch(updateCues(cues));


        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={(): void => {}} />
            </Provider>
        );
        actualNode.find("input[type='number']")
            .simulate('change', { target: { value: 1 } });
        actualNode.find("button.dotsub-shift-modal-apply-button")
            .simulate('click');


        // THEN
        // expect(applyShiftSpy).toBeCalled
    });



    it("Calls cancel when click apply", () => {
        // GIVEN
        const onClose = sinon.spy();

        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={onClose} />
            </Provider>
        );

        actualNode.find(".btn.btn-secondary")
            .simulate('click');


        // THEN
        sinon.assert.called(onClose)
    });
});
