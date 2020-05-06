import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { AnyAction } from "redux";
import { CueDto } from "../../model";
import DeleteCueLineButton from "./DeleteCueLineButton";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";
import { updateCues } from "../cueSlices";
import _ from "lodash";
import { setSaveTrack } from "../saveSlices";

describe("DeleteCueLineButton", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <button
                style={{ maxHeight: "38px", margin: "5px" }}
                className="btn btn-outline-secondary sbte-delete-cue-button"
            >
                <i className="fa fa-trash" />
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <DeleteCueLineButton cueIndex={0} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("deletes cue when delete cue button is clicked", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <DeleteCueLineButton cueIndex={0} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-delete-cue-button").simulate("click");

        // THEN
        expect(testingStore.getState().cues.length).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Cue 2");
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
    });

    it("calls saveTrack in redux store when delete button is clicked", () => {
        // GIVEN
        const saveTrack = jest.fn();
        // @ts-ignore
        jest.spyOn(_, "debounce").mockReturnValue(() => { saveTrack(); });
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

        const cues = [
            { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <DeleteCueLineButton cueIndex={0} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-delete-cue-button").simulate("click");

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });
});
