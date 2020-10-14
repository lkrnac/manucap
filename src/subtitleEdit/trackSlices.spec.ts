import { Task, Track } from "./model";
import { editingTrackSlice, resetEditingTrack, updateEditingTrack, updateTask } from "./trackSlices";
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

let testingStore = createTestingStore();
deepFreeze(testingStore.getState());

describe("trackSlices", () => {
    describe("updateEditingTrack", () => {
        it("updates editing track", () => {
            // WHEN
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingTrack).toEqual(testingTrack);
        });

        it("does not overwrite editingTrack spellcheckerDisabled value when updating editing track", () => {
            //GIVEN
            const trackWithSpellcheckDisabledAsTrue =  {
                type: "CAPTION",
                language: { id: "en-US" },
                default: true,
                mediaTitle: "This is the video title",
                spellcheckerDisabled: true
            } as Track;
            testingStore = createTestingStore({ editingTrack: trackWithSpellcheckDisabledAsTrue });

            // WHEN
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingTrack.spellcheckerDisabled).toEqual(true);
        });
    });

    describe("resetEditingTrack", () => {
        it("resets editing track", () => {
            // GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(resetEditingTrack() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingTrack).toEqual(null);
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

    describe("disableSpellchecker", () => {
        it("sets spellcheckerDisabled to true when calling", () => {
            //GIVEN
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(editingTrackSlice.actions.disableSpellchecker() as {} as AnyAction);

            // THEN
            expect(testingStore.getState().editingTrack.spellcheckerDisabled).toEqual(true);
        });
    });
});
