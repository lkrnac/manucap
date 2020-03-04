import { Task, Track } from "./model";
import { updateEditingTrack, updateTask } from "./trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../testUtils/testingStore";
import deepFreeze from "deep-freeze";

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
    mediaTitle: "This is the video title",
} as Track;

const testingTask = {
    type: "TASK_CAPTION",
    projectName: "Project One",
    dueDate: "2019/12/30 10:00AM"
} as Task;

const testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("trackSlices", () => {
    describe("updateEditingTrack", () => {
        it("updates editing track", () => {
            // WHEN
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingTrack).toEqual(testingTrack);
        });
    });

    describe("updateTask", () => {
        it("updates task", () => {
            // WHEN
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cuesTask).toEqual(testingTask);
        });
    });
});
