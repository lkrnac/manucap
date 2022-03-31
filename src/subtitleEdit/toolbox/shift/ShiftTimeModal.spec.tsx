import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { updateCues } from "../../cues/cuesList/cuesListActions";
import { AnyAction } from "@reduxjs/toolkit";
import { CueDto, Language, Track } from "../../model";
import { Provider } from "react-redux";
import ShiftTimesModal from "./ShiftTimeModal";
import { setSaveTrack } from "../../cues/saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { createTestingStore } from "../../../testUtils/testingStore";
import { cleanup, fireEvent, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback
}));

const testCuesForNegativeShifting = [
    { vttCue: new VTTCue(1, 3, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(3, 5, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

const testCues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

const testCuesChunk = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE", editDisabled: true },
    {
        vttCue: new VTTCue(1.25, 1.5, "Caption Line 2"), cueCategory: "DIALOGUE",
        editDisabled: false
    },
    {
        vttCue: new VTTCue(1.5, 2.5, "Caption Line 3"), cueCategory: "DIALOGUE",
        editDisabled: false
    },
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

const removeIds = (html: string): string => {
    return html.replace(/id="\w+" /g, "")
        .replace(/pr_id_\d(_\w*)/g, "")
        .replace(/ pr_id_\d=""/g, "");
};

describe("ShiftTimesModal", () => {
    const saveTrack = jest.fn();
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);
        jest.clearAllMocks();
        document.body.innerHTML = "";
        cleanup();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <div
                className="p-dialog p-component tw-max-w-3xl p-dialog-enter p-dialog-enter-active"
                role="dialog"
                aria-labelledby=""
                aria-describedby=""
                aria-modal="true"
            >
                <div className="p-dialog-header">
                    <div className="p-dialog-title">Shift Track Lines Time</div>
                    <div className="p-dialog-header-icons">
                        <button
                            type="button"
                            className="p-dialog-header-icon p-dialog-header-close p-link"
                            aria-label="Close"
                        >
                            <span className="p-dialog-header-close-icon pi pi-times" />
                        </button>
                    </div>
                </div>
                <div className="p-dialog-content">
                    <form>
                        <div className="form-group"><label>Time Shift in Seconds.Milliseconds</label>
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
                    </form>
                </div>
                <div className="p-dialog-footer">
                    <button
                        type="submit"
                        className="dotsub-shift-modal-apply-button btn btn-primary"
                    >Apply
                    </button>
                    <button
                        type="button"
                        className="dotsub-shift-modal-close-button btn btn-secondary"
                    >Close
                    </button>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render((
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        ), { container: document.body });

        const allCuesRadioBtn = document.querySelectorAll(".form-check input[value='all']")[0];
        fireEvent.click(allCuesRadioBtn);

        // THEN
        const actual = removeIds((actualNode.container.querySelector(".p-dialog") as Element).outerHTML);
        const expected = (expectedNode.container.querySelector(".p-dialog") as Element).outerHTML;
        expect(actual).toEqual(expected);
    });

    it("renders error message and disable apply button if shift is not valid", () => {
        // GIVEN
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);

        const expectedNode = render(
            <div
                className="p-dialog p-component tw-max-w-3xl p-dialog-enter p-dialog-enter-active"
                role="dialog"
                aria-labelledby=""
                aria-describedby=""
                aria-modal="true"
            >
                <div className="p-dialog-header">
                    <div className="p-dialog-title">Shift Track Lines Time</div>
                    <div className="p-dialog-header-icons">
                        <button
                            type="button"
                            className="p-dialog-header-icon p-dialog-header-close p-link"
                            aria-label="Close"
                        >
                            <span className="p-dialog-header-close-icon pi pi-times" />
                        </button>
                    </div>
                </div>
                <div className="p-dialog-content">
                    <form>
                        <div className="form-group"><label>Time Shift in Seconds.Milliseconds</label>
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
                        <span
                            className="alert alert-danger"
                            style={{ display: "block" }}
                        >
                            The start time of the first cue plus the shift value must be greater or equal to 0
                        </span>
                    </form>
                </div>
                <div className="p-dialog-footer">
                    <button
                        type="submit"
                        disabled
                        className="dotsub-shift-modal-apply-button btn btn-primary"
                    >Apply
                    </button>
                    <button
                        type="button"
                        className="dotsub-shift-modal-close-button btn btn-secondary"
                    >Close
                    </button>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render((
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        ), { container: document.body });

        const input = document.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = document.querySelectorAll(".form-check input[value='all']")[0];
        userEvent.type(input, "-1");
        fireEvent.click(allCuesRadioBtn);

        // THEN
        const actual = removeIds((actualNode.container.querySelector(".p-dialog") as Element).outerHTML);
        const expected = (expectedNode.container.querySelector(".p-dialog") as Element).outerHTML;
        expect(actual).toEqual(expected);
    });

    it("doesn't render error message and disable apply button if track is chunked", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);
        const expectedNode = render(
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
                                <div className="modal-title h4">Shift Track Lines Time</div>
                                <button type="button" className="close">
                                    <span aria-hidden="true">×</span>
                                    <span className="sr-only">Close</span>
                                </button>
                            </div>
                            <form>
                                <div className="modal-body">
                                    <div className="form-group"><label>Time Shift in Seconds.Milliseconds</label>
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
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="submit"
                                        className="dotsub-shift-modal-apply-button btn btn-primary"
                                    >Apply
                                    </button>
                                    <button
                                        type="button"
                                        className="dotsub-shift-modal-close-button btn btn-secondary"
                                    >Close
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        render(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={(): void => undefined} />
            </Provider>
        );
        const input = document.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = document.querySelectorAll(".form-check input[value='all']")[0];
        userEvent.type(input, "-1");
        fireEvent.click(allCuesRadioBtn);

        // THEN
        expect(document.body.querySelectorAll(".modal")[0].outerHTML)
            .toEqual(expectedNode.container.querySelectorAll(".modal")[0].outerHTML);
    });

    it("applies the shift time on form submit with a valid shift value", () => {
        // // GIVEN
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);
        render(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = document.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = document.querySelectorAll(".form-check input[value='all']")[0];
        const submitBtn = document.querySelectorAll(".dotsub-shift-modal-apply-button")[0];
        userEvent.type(input, "1");
        fireEvent.click(allCuesRadioBtn);
        fireEvent.click(submitBtn);

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
    });

    it("validates the shift time on form submit for media chunk start", async () => {
        // // GIVEN
        testingStore.dispatch(updateEditingTrack(testingCaptionTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testCuesChunk) as {} as AnyAction);
        const { container } = render((
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        ), { container: document.body });

        // WHEN
        const input = container.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = container.querySelectorAll(".form-check input[value='all']")[0];
        const submitBtn = container.querySelectorAll(".dotsub-shift-modal-apply-button")[0];
        fireEvent.change(input, { target: { value: "-0.5" }});
        fireEvent.click(allCuesRadioBtn);
        fireEvent.click(submitBtn);

        // THEN
        expect(container.querySelectorAll(".alert-danger")[0].innerHTML)
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
        render(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = document.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = document.querySelectorAll(".form-check input[value='all']")[0];
        const submitBtn = document.querySelectorAll(".dotsub-shift-modal-apply-button")[0];
        userEvent.type(input, "0.6");
        fireEvent.click(allCuesRadioBtn);
        fireEvent.click(submitBtn);


        // THEN
        expect(document.querySelectorAll(".alert-danger")[0].innerHTML)
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
        render(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = document.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = document.querySelectorAll(".form-check input[value='all']")[0];
        const submitBtn = document.querySelectorAll(".dotsub-shift-modal-apply-button")[0];
        userEvent.type(input, "0.25");
        fireEvent.click(allCuesRadioBtn);
        fireEvent.click(submitBtn);

        // THEN
        expect(document.querySelectorAll(".alert-danger").length).toEqual(0);
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
        const onClose = jest.fn();
        render(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={onClose} />
            </Provider>
        );

        // WHEN
        const closeBtn = document.querySelectorAll(".btn.btn-secondary")[0];
        fireEvent.click(closeBtn);

        // THEN
        expect(onClose).toBeCalled();
    });

    it("calls saveTrack in redux store when shift value", () => {
        // // GIVEN
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);

        render(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = document.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = document.querySelectorAll(".form-check input[value='all']")[0];
        const submitBtn = document.querySelectorAll(".dotsub-shift-modal-apply-button")[0];
        userEvent.type(input, "1");
        fireEvent.click(allCuesRadioBtn);
        fireEvent.click(submitBtn);

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });

    it("shift by minus when shifting value does not generate negative cue time", async () => {
        // GIVEN
        testingStore.dispatch(updateCues(testCuesForNegativeShifting) as {} as AnyAction);

        render(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = document.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = document.querySelectorAll(".form-check input[value='all']")[0];
        const submitBtn = document.querySelectorAll(".dotsub-shift-modal-apply-button")[0];

        await act(async () => {
            await userEvent.type(input, "-0.153", { delay: 100 });
        });

        fireEvent.click(allCuesRadioBtn);
        fireEvent.click(submitBtn);

        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0.847);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2.847);
    });

    it("does not shift by minus when shifting value would generate negative cue time", async () => {
        // GIVEN
        testingStore.dispatch(updateCues(testCues) as {} as AnyAction);
        render(
            <Provider store={testingStore}>
                <ShiftTimesModal show onClose={jest.fn()} />
            </Provider>
        );

        // WHEN
        const input = document.querySelectorAll("input[name='shiftTime']")[0];
        const allCuesRadioBtn = document.querySelectorAll(".form-check input[value='all']")[0];
        const submitBtn = document.querySelectorAll(".dotsub-shift-modal-apply-button")[0];
        await act(async () => {
            await userEvent.type(input, "-0.153", { delay: 100 });
        });
        fireEvent.click(allCuesRadioBtn);
        fireEvent.click(submitBtn);


        // THEN
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(0);
        expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(1);
    });
});
