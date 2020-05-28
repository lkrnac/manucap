import "../testUtils/initBrowserEnvironment";
import React from "react";
import { mount } from "enzyme";
import CompleteButton from "./CompleteButton";
import { createTestingStore } from "../testUtils/testingStore";
import { Provider } from "react-redux";
import { updateEditingTrack, updateTask } from "./trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { CueDto, Language, Task, Track } from "./model";
import { updateCues } from "./cues/cueSlices";
import { callSaveTrack, setAutoSaveSuccess } from "./cues/saveSlices";

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
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <>
                    <div
                        style={{ "textAlign": "center", "margin": "8px 10px 0px 0px" }}
                        className="sbte-light-gray-text"
                    >
                        <span> &nbsp;<i hidden className="fas fa-sync fa-spin"></i></span>
                    </div>

                    <button type="button" className="btn btn-primary sbte-complete-subtitle-btn">
                        Complete
                    </button>
                </>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CompleteButton onComplete={jest.fn()} />
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
                <CompleteButton onComplete={mockOnComplete} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-complete-subtitle-btn").simulate("click");

        // THEN
        expect(mockOnComplete).toHaveBeenCalledWith(
            { editingTrack: testingStore.getState().editingTrack, cues: testingStore.getState().cues });
    });

    describe("Shows Save Status", () => {
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 123456,
            progress: 0
        } as Track;
        const testingTask = {
            type: "TASK_CAPTION",
            projectName: "Project One",
            dueDate: "2019/12/30 10:00AM"
        } as Task;
        const mockOnComplete = jest.fn();
        it("renders save status label when save is called", () => {
            // GIVEN
            const expectedNode = mount(
                <Provider store={testingStore}>
                    <>
                        <div
                            style={{ "textAlign": "center", "margin": "8px 10px 0px 0px" }}
                            className="sbte-light-gray-text"
                        >
                            <span>Saving changes &nbsp;<i className="fas fa-sync fa-spin"></i></span>
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary sbte-complete-subtitle-btn"
                            disabled
                        >
                            Complete
                        </button>
                    </>
                </Provider>
            );

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CompleteButton onComplete={mockOnComplete} />
                </Provider>
            );
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            testingStore.dispatch(updateCues([]) as {} as AnyAction);
            testingStore.dispatch(callSaveTrack() as {} as AnyAction);

            // THEN
            expect(actualNode.html()).toEqual(expectedNode.html());
        });

        it("renders save status label when save is successful", () => {
            // GIVEN
            const expectedNode = mount(
                <Provider store={testingStore}>
                    <>
                        <div
                            style={{ "textAlign": "center", "margin": "8px 10px 0px 0px" }}
                            className="sbte-light-gray-text"
                        >
                            <span>
                                All changes saved to server &nbsp;<i hidden className="fas fa-sync fa-spin" ></i>
                            </span>
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary sbte-complete-subtitle-btn"
                        >
                            Complete
                        </button>
                    </>
                </Provider>
            );

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CompleteButton onComplete={mockOnComplete} />
                </Provider>
            );
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            testingStore.dispatch(updateCues([]) as {} as AnyAction);
            testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

            // THEN
            expect(actualNode.html()).toEqual(expectedNode.html());
        });

        it("renders save status label when save fails", () => {
            // GIVEN
            const expectedNode = mount(
                <Provider store={testingStore}>
                    <>
                        <div
                            style={{ "textAlign": "center", "margin": "8px 10px 0px 0px" }}
                            className="sbte-light-gray-text"
                        >
                            <span>
                                Error saving latest changes &nbsp;<i hidden className="fas fa-sync fa-spin"></i>
                            </span>
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary sbte-complete-subtitle-btn"
                        >
                            Complete
                        </button>
                    </>
                </Provider>
            );

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CompleteButton onComplete={mockOnComplete} />
                </Provider>
            );
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);
            testingStore.dispatch(updateCues([]) as {} as AnyAction);
            testingStore.dispatch(setAutoSaveSuccess(false) as {} as AnyAction);

            // THEN
            expect(actualNode.html()).toEqual(expectedNode.html());
        });

    });

});
