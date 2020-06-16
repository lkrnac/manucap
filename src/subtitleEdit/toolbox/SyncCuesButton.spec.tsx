import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount, shallow } from "enzyme";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import SyncCuesButton from "./SyncCuesButton";
import { setSaveTrack } from "../cues/saveSlices";
import { AnyAction } from "redux";
import { updateEditingTrack } from "../trackSlices";
import { Track } from "../model";
import _ from "lodash";

let testingStore = createTestingStore();

describe("SyncCuesButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
    it("renders", () => {
        // GIVEN
        const expectedNode = shallow(
            <button type="button" className="sbte-sync-cues-button btn btn-secondary">
                <i className="fas fa-sync" /> Sync Cues
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SyncCuesButton />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
    it("saves track on button click", () => {
        // GIVEN
        const saveTrack = jest.fn();
        // @ts-ignore
        jest.spyOn(_, "debounce").mockReturnValue(() => { saveTrack(); });
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <SyncCuesButton />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-sync-cues-button").simulate("click");

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });
    it("unsets the track id on button click", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack({ id: "123456" } as Track) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <SyncCuesButton />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-sync-cues-button").simulate("click");

        // THEN
        expect(testingStore.getState().editingTrack.id).not.toBeDefined();
    });
});
