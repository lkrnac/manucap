import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { updateCues } from "../../cues/cuesList/cuesListActions";
import { AnyAction } from "@reduxjs/toolkit";
import { CueDto, Language, Track } from "../../model";
import { Provider } from "react-redux";
import ShiftTimesModal from "./ShiftTimeModal";
import { mount } from "enzyme";
import sinon from "sinon";
import { setSaveTrack } from "../../cues/saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { createTestingStore } from "../../../testUtils/testingStore";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback
}));

const testCues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

const testCuesChunk = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE", editDisabled: true },
    { vttCue: new VTTCue(1.25, 1.5, "Caption Line 2"), cueCategory: "DIALOGUE",
        editDisabled: false },
    { vttCue: new VTTCue(1.5, 2.5, "Caption Line 3"), cueCategory: "DIALOGUE",
        editDisabled: false },
    { vttCue: new VTTCue(5, 6, "Caption Line 4"), cueCategory: "DIALOGUE", editDisabled: true },
] as CueDto[];

const testingCaptionTrack = {
    type: "CAPTION",
    language: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
    mediaChunkStart: 1000,
    mediaChunkEnd: 3000,
    progress: 50
} as Track;

let testingStore = createTestingStore();

const expectedNodeWithErrorMsg = mount(
    <Provider store={testingStore}>
        <div className="fade modal-backdrop show" />
        <div role="dialog" aria-modal="true" className="fade modal show" tabIndex={-1} style={{ display: "block" }}>
            <div className="modal-dialog sbte-medium-modal modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="modal-title h4">Shift Track Lines Time</div >
                        <button type="button" className="close">
                            <span aria-hidden="true">×</span >
                            <span className="sr-only">Close</span >
                        </button >
                    </div >
                    <form>
                        <div className="modal-body">
                            <div className="form-group"><label >Time Shift in Seconds.Milliseconds</label >
                                <input
                                    name="shiftTime"
                                    type="number"
                                    className="form-control dotsub-track-line-shift margin-right-10"
                                    style={{ width: "120px" }}
                                    placeholder="0.000"
                                    step="0.100"
                                    value="-1.000"
                                    onChange={jest.fn()}
                                />
                            </div>
                            <div className="form-check">
                                <label>
                                    <input
                                        name="shiftPosition"
                                        type="radio"
                                        className="form-check-input"
                                        value="all"
                                    /> Shift all
                                </label>
                            </div>
                            <div className="form-check">
                                <label>
                                    <input
                                        name="shiftPosition"
                                        type="radio"
                                        className="form-check-input"
                                        value="before"
                                    /> Shift all before editing cue
                                </label>
                            </div>
                            <div className="form-check">
                                <label>
                                    <input
                                        name="shiftPosition"
                                        type="radio"
                                        className="form-check-input"
                                        value="after"
                                    /> Shift all after editing cue
                                </label>
                            </div>
                            <span className="alert alert-danger" style={{ display: "block" }}>
                                The start time of the first cue plus the shift value must be greater or equal to 0
                            </span >
                        </div >
                        <div className="modal-footer">
                            <button
                                type="submit"
                                disabled
                                className="dotsub-shift-modal-apply-button btn btn-primary"
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

describe("ShiftTimesModal", () => {
    const saveTrack = jest.fn();
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);
    });

    it("renders", () => {
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
                    <div className="modal-dialog sbte-medium-modal modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title h4">Shift Track Lines Time</div >
                                <button type="button" className="close">
                                    <span aria-hidden="true">×</span >
                                    <span className="sr-only">Close</span >
                                </button >
                            </div >
                            <form>
                                <div className="modal-body">
                                    <div className="form-group"><label >Time Shift in Seconds.Milliseconds</label >
                                        <input
                                            name="shiftTime"
                                            type="number"
                                            className="form-control dotsub-track-line-shift margin-right-10"
                                            style={{ width: "120px" }}
                                            placeholder="0.000"
                                            step="0.100"
                                            value=""
                                            onChange={jest.fn()}
                                        />
                                    </div >
                                    <div className="form-check">
                                        <label>
                                            <input
                                                name="shiftPosition"
                                                type="radio"
                                                className="form-check-input"
                                                value="all"
                                            /> Shift all
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <label>
                                            <input
                                                name="shiftPosition"
                                                type="radio"
                                                className="form-check-input"
                                                value="before"
                                            /> Shift all before editing cue
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <label>
                                            <input
                                                name="shiftPosition"
                                                type="radio"
                                                className="form-check-input"
                                                value="after"
                                            /> Shift all after editing cue
                                        </label>
                                    </div>
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
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={(): void => undefined} />
            </Provider >
        );

        actualNode.find(".form-check input[value='all']").simulate("change", { target: { value: "all" }});

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

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
        actualNode.find(".form-check input[value='all']").simulate("change", { target: { value: "all" }});

        // THEN
        expect(actualNode.html()).toEqual(expectedNodeWithErrorMsg.html());
    });

    it("doesn't render error message and disable apply button if track is chunked", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);
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
                    <div className="modal-dialog sbte-medium-modal modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title h4">Shift Track Lines Time</div >
                                <button type="button" className="close">
                                    <span aria-hidden="true">×</span >
                                    <span className="sr-only">Close</span >
                                </button >
                            </div >
                            <form>
                                <div className="modal-body">
                                    <div className="form-group"><label >Time Shift in Seconds.Milliseconds</label >
                                        <input
                                            name="shiftTime"
                                            type="number"
                                            className="form-control dotsub-track-line-shift margin-right-10"
                                            style={{ width: "120px" }}
                                            placeholder="0.000"
                                            step="0.100"
                                            value="-1.000"
                                            onChange={jest.fn()}
                                        />
                                    </div >
                                    <div className="form-check">
                                        <label>
                                            <input
                                                name="shiftPosition"
                                                type="radio"
                                                className="form-check-input"
                                                value="all"
                                            /> Shift all
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <label>
                                            <input
                                                name="shiftPosition"
                                                type="radio"
                                                className="form-check-input"
                                                value="before"
                                            /> Shift all before editing cue
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <label>
                                            <input
                                                name="shiftPosition"
                                                type="radio"
                                                className="form-check-input"
                                                value="after"
                                            /> Shift all after editing cue
                                        </label>
                                    </div>
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
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={(): void => undefined} />
            </Provider >
        );
        actualNode.find("input[type='number']").simulate("change", { target: { value: -1 }});
        actualNode.find(".form-check input[value='all']").simulate("change", { target: { value: "all" }});

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("applies the shift time on form submit with a valid shift value", () => {
        // // GIVEN
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider >
        );

        // WHEN
        actualNode.find("input[name='shiftTime']").simulate("change", { target: { value: 1 }});
        actualNode.find(".form-check input[value='all']").simulate("change", { target: { value: "all" }});
        actualNode.find("form").simulate("submit");

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
    });

    it("validates the shift time on form submit for media chunk start", () => {
        // // GIVEN
        testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testCuesChunk) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider >
        );

        // WHEN
        actualNode.find("input[name='shiftTime']").simulate("change", { target: { value: -.5 }});
        actualNode.find(".form-check input[value='all']").simulate("change", { target: { value: "all" }});
        actualNode.find("form").simulate("submit");

        // THEN
        expect(actualNode.find(".alert-danger").props().children)
            .toEqual("Exceeds media chunk start range");
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1.25);
        expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(1.5);
        expect(testingStore.getState().cues[3].vttCue.startTime).toEqual(5);
    });

    it("validates the shift time on form submit for media chunk end", () => {
        // // GIVEN
        testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testCuesChunk) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider >
        );

        // WHEN
        actualNode.find("input[name='shiftTime']").simulate("change", { target: { value: .6 }});
        actualNode.find(".form-check input[value='all']").simulate("change", { target: { value: "all" }});
        actualNode.find("form").simulate("submit");

        // THEN
        expect(actualNode.find(".alert-danger").props().children)
            .toEqual("Exceeds media chunk end range");
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1.25);
        expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(1.5);
        expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(2.5);
        expect(testingStore.getState().cues[3].vttCue.startTime).toEqual(5);
    });

    it("shifts time on form submit for media chunk cues", () => {
        // // GIVEN
        testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testCuesChunk) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider >
        );

        // WHEN
        actualNode.find("input[name='shiftTime']").simulate("change", { target: { value: .25 }});
        actualNode.find(".form-check input[value='all']").simulate("change", { target: { value: "all" }});
        actualNode.find("form").simulate("submit");

        // THEN
        expect(actualNode.find(".alert-danger").length).toEqual(0);
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1.50);
        expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(1.75);
        expect(testingStore.getState().cues[2].vttCue.startTime).toEqual(1.75);
        expect(testingStore.getState().cues[2].vttCue.endTime).toEqual(2.75);
        expect(testingStore.getState().cues[3].vttCue.startTime).toEqual(5);
        expect(testingStore.getState().cues[3].vttCue.endTime).toEqual(6);
    });

    it("calls cancel when click apply", () => {
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
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider >
        );
        saveTrack.mockReset();

        // WHEN
        actualNode.find("input[name='shiftTime']").simulate("change", { target: { value: 1 }});
        actualNode.find(".form-check input[value='all']").simulate("change", { target: { value: "all" }});
        actualNode.find("form").simulate("submit");

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });
});
