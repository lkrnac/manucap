import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { AnyAction } from "@reduxjs/toolkit";

import { CueDto, Task, Track } from "../../model";
import { createTestingStore } from "../../../testUtils/testingStore";
import { updateEditingTrack, updateTask } from "../../trackSlices";
import { updateSourceCues } from "./sourceCueSlices";
import { updateCues } from "../cuesList/cuesListActions";
import ClickCueWrapper from "./ClickCueWrapper";

let testingStore = createTestingStore();
const testTrack = { mediaTitle: "testingTrack", language: { id: "en-US", name: "English", direction: "LTR" }};

describe("ClickCueWrapper", () => {
    beforeEach(()=> {
       testingStore = createTestingStore();
       testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
    });

    describe("caption mode", () => {
        it("open cue for editing if clicked for existing one", async () => {
            // GIVEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <ClickCueWrapper
                        targetCueIndex={6}
                        targetCuesLength={8}
                        sourceCuesIndexes={[]}
                        nextTargetCueIndex={-1}
                    />
                </Provider>
            );
            const testingTask = {
                type: "TASK_CAPTION",
                projectName: "Project One",
                dueDate: "2019/12/30 10:00AM",
                editDisabled: false
            } as Task;
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

            // WHEN
            await act(async () => {
                fireEvent.click(actualNode.container.querySelector("div") as Element);
            });

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(6);
        });

        it("doesn't open cue if task disables editing", async () => {
            // GIVEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <ClickCueWrapper
                        targetCueIndex={6}
                        targetCuesLength={8}
                        sourceCuesIndexes={[]}
                        nextTargetCueIndex={-1}
                    />
                </Provider>
            );
            const testingTask = {
                type: "TASK_CAPTION",
                projectName: "Project One",
                dueDate: "2019/12/30 10:00AM",
                editDisabled: true
            } as Task;
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

            // WHEN
            await act(async () => {
                fireEvent.click(actualNode.container.querySelector("div") as Element);
            });

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });

        it("doesn't open cue if task is not defined", async () => {
            // GIVEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <ClickCueWrapper
                        targetCueIndex={6}
                        targetCuesLength={8}
                        sourceCuesIndexes={[]}
                        nextTargetCueIndex={-1}
                    />
                </Provider>
            );

            // WHEN
            await act(async () => {
                fireEvent.click(actualNode.container.querySelector("div") as Element);
            });

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });
    });

    describe("translation mode", () => {
        it("adds a cue when clicked if cue index is equal to target cues count", async () => {
            // GIVEN
            testingStore.dispatch(updateSourceCues([
                { vttCue: new VTTCue(1, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 4, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);

            const actualNode = render(
                <Provider store={testingStore}>
                    <ClickCueWrapper
                        targetCueIndex={0}
                        targetCuesLength={0}
                        sourceCuesIndexes={[0, 1]}
                        nextTargetCueIndex={-1}
                    />
                </Provider>
            );

            // WHEN
            await act(async () => {
                fireEvent.click(actualNode.container.querySelector("div") as Element);
            });

            // THEN
            expect(testingStore.getState().cues).toHaveLength(1);
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("");
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(4);
        });

        it("adds a cue when clicked if cue index is bigger than to target cues count", async () => {
            // GIVEN
            testingStore.dispatch(updateSourceCues([
                { vttCue: new VTTCue(1, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 4, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);

            const actualNode = render(
                <Provider store={testingStore}>
                    <ClickCueWrapper
                        targetCueIndex={1}
                        targetCuesLength={0}
                        sourceCuesIndexes={[0, 1]}
                        nextTargetCueIndex={-1}
                    />
                </Provider>
            );

            // WHEN
            await act(async () => {
                fireEvent.click(actualNode.container.querySelector("div") as Element);
            });

            // THEN
            expect(testingStore.getState().cues).toHaveLength(1);
            expect(testingStore.getState().cues[0].vttCue.text).toEqual("");
            expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
            expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(4);
        });

        it("open cue for editing if clicked for existing one", async () => {
            // GIVEN
            testingStore.dispatch(updateSourceCues([
                { vttCue: new VTTCue(1, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 4, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);

            const actualNode = render(
                <Provider store={testingStore}>
                    <ClickCueWrapper
                        targetCueIndex={6}
                        targetCuesLength={8}
                        sourceCuesIndexes={[0, 1]}
                        nextTargetCueIndex={-1}
                    />
                </Provider>
            );
            const testingTask = {
                type: "TASK_CAPTION",
                projectName: "Project One",
                dueDate: "2019/12/30 10:00AM",
                editDisabled: false
            } as Task;
            testingStore.dispatch(updateTask(testingTask) as {} as AnyAction);

            // WHEN
            await act(async () => {
                fireEvent.click(actualNode.container.querySelector("div") as Element);
            });

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(6);
        });

        it("adds a cue when clicked if cue index is undefined and this is last cue", async () => {
            // GIVEN
            testingStore.dispatch(updateSourceCues([
                { vttCue: new VTTCue(1, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 4, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);

            testingStore.dispatch(updateCues([
                { vttCue: new VTTCue(1, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);

            const actualNode = render(
                <Provider store={testingStore}>
                    <ClickCueWrapper
                        targetCuesLength={1}
                        sourceCuesIndexes={[0, 1]}
                        nextTargetCueIndex={-1}
                    />
                </Provider>
            );

            // WHEN
            await act(async () => {
                fireEvent.click(actualNode.container.querySelector("div") as Element);
            });

            // THEN
            expect(testingStore.getState().cues).toHaveLength(2);
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("");
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(4);
        });

        it("adds a cue when clicked if cue index is undefined and this is middle cue", async () => {
            // GIVEN
            testingStore.dispatch(updateSourceCues([
                { vttCue: new VTTCue(1, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 4, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4, 6, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);

            testingStore.dispatch(updateCues([
                { vttCue: new VTTCue(1, 2.5, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3.5, 6, "Target Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[]) as {} as AnyAction);

            const actualNode = render(
                <Provider store={testingStore}>
                    <ClickCueWrapper
                        targetCuesLength={1}
                        sourceCuesIndexes={[0, 1]}
                        nextTargetCueIndex={1}
                    />
                </Provider>
            );

            // WHEN
            await act(async () => {
                fireEvent.click(actualNode.container.querySelector("div") as Element);
            });

            // THEN
            expect(testingStore.getState().cues).toHaveLength(3);
            expect(testingStore.getState().cues[1].vttCue.text).toEqual("");
            expect(testingStore.getState().cues[1].vttCue.startTime).toEqual(2.5);
            expect(testingStore.getState().cues[1].vttCue.endTime).toEqual(3.5);
        });
    });
});
