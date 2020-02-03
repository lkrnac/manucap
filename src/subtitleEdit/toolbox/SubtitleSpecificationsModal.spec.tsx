import "../../testUtils/initBrowserEnvironment";
import { Provider } from "react-redux";
import React from "react";
import { SubtitleSpecification } from "./model";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import { mount } from "enzyme";
import { readSubtitleSpecification } from "./subtitleSpecificationSlice";
import testingStore from "../../testUtils/testingStore";

describe("SubtitleSpecificationsModal", () => {
    it("renders shown", () => {
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
                    <div
                        role="document"
                        className="modal-dialog sbte-medium-modal modal-dialog-centered"
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title h4">Subtitle Specifications</div>
                                <button type="button" className="close">
                                    <span aria-hidden="true">×</span>
                                    <span className="sr-only">Close</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <label><strong>Enabled:&nbsp;</strong></label><label>No</label>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="dotsub-subtitle-specifications-modal-close-button btn btn-primary"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(readSubtitleSpecification({ enabled: false } as SubtitleSpecification));
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsModal show onClose={(): void => {}} />
            </Provider>
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });
});
