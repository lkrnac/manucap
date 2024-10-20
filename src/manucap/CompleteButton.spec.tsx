import "../testUtils/initBrowserEnvironment";
import { mount } from "enzyme";
import CompleteButton from "./CompleteButton";
import { createTestingStore } from "../testUtils/testingStore";
import { Provider } from "react-redux";
import { updateEditingTrack } from "./trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { CueDto, Track } from "./model";
import { updateCues } from "./cues/cuesList/cuesListActions";
import { setSaveTrack } from "./cues/saveSlices";
import { mdiAlertOutline, mdiCheckCircleOutline, mdiLoading } from "@mdi/js";
import Icon from "@mdi/react";

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
} as Track;

const cues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

let testingStore = createTestingStore();

describe("CompleteButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
    const saveTrack = jest.fn();
    beforeEach(() => {
        // GIVEN
        saveTrack.mockReset();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
    });

    it("renders for save state NONE", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="space-x-4 flex items-center">
                    <div className="font-medium">
                        <span hidden className="flex items-center ">
                            <span className="leading-none pr-4" />
                            <Icon path="" size={1.5} />
                        </span>
                    </div>
                    <button type="button" className="mc-btn mc-btn-primary mc-complete-caption-mc-btn">
                        Complete
                    </button>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CompleteButton onComplete={jest.fn()} saveState={"NONE"} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with disabled property and save state NONE", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="space-x-4 flex items-center">
                    <div className="font-medium">
                        <span className="text-green-primary">
                            Edits are disabled, task is already completed
                        </span>
                    </div>
                    <button
                        type="button"
                        className="mc-btn mc-btn-primary mc-complete-caption-mc-btn"
                        disabled
                    >
                        Complete
                    </button>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CompleteButton onComplete={jest.fn()} disabled saveState={"NONE"} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with disabled property and save state TRIGGERED", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="space-x-4 flex items-center">
                    <div className="font-medium">
                        <span className="flex items-center ">
                            <span className="leading-none pr-4">Saving changes</span>
                            <Icon path={mdiLoading} size={1.5} spin />
                        </span>
                    </div>
                    <button
                        type="button"
                        className="mc-btn mc-btn-primary mc-complete-caption-mc-btn"
                        disabled
                    >
                        Complete
                    </button>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CompleteButton onComplete={jest.fn()} disabled saveState={"TRIGGERED"} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders save pending for save state TRIGGERED", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="space-x-4 flex items-center">
                    <div className="font-medium">
                        <span className="flex items-center ">
                            <span className="leading-none pr-4">Saving changes</span>
                            <Icon path={mdiLoading} size={1.5} spin />
                        </span>
                    </div>
                    <button
                        type="button"
                        className="mc-btn mc-btn-primary mc-complete-caption-mc-btn"
                        disabled
                    >
                        Complete
                    </button>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CompleteButton onComplete={jest.fn()} saveState={"TRIGGERED"} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders save succeeded for save state SAVED", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="space-x-4 flex items-center">
                    <div className="font-medium">
                        <span className="flex items-center text-green-light">
                            <span className="leading-none pr-4">All changes saved to server</span>
                            <Icon path={mdiCheckCircleOutline} size={1.5} />
                        </span>
                    </div>
                    <button type="button" className="mc-btn mc-btn-primary mc-complete-caption-mc-btn">
                        Complete
                    </button>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CompleteButton onComplete={jest.fn()} saveState={"SAVED"} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders save succeeded for save state ERROR", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="space-x-4 flex items-center">
                    <div className="font-medium">
                        <span className="flex items-center text-danger">
                            <span className="leading-none pr-4">Error saving latest changes</span>
                            <Icon path={mdiAlertOutline} size={1.5} />
                        </span>
                    </div>
                    <button type="button" className="mc-btn mc-btn-primary mc-complete-caption-mc-btn">
                        Complete
                    </button>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CompleteButton onComplete={jest.fn()} saveState={"ERROR"} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("calls onComplete when clicked", () => {
        // GIVEN
        const mockOnComplete = jest.fn();
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CompleteButton onComplete={mockOnComplete} saveState={"NONE"} />
            </Provider>
        );

        // WHEN
        actualNode.find(".mc-complete-caption-mc-btn").simulate("click");

        // THEN
        expect(mockOnComplete).toHaveBeenCalledWith(
            { editingTrack: testingStore.getState().editingTrack, cues: testingStore.getState().cues });
    });
});
