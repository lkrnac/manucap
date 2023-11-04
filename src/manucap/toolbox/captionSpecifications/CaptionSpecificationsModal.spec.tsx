import "../../../testUtils/initBrowserEnvironment";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { CaptionSpecification } from "../model";
import CaptionSpecificationsModal from "./CaptionSpecificationsModal";
import { mount } from "enzyme";
import { readCaptionSpecification } from "./captionSpecificationSlice";
import testingStore from "../../../testUtils/testingStore";
import { removeIds } from "../../../testUtils/testUtils";

describe("CaptionSpecificationsModal", () => {
    it("renders shown", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div
                    className="p-dialog-mask p-dialog-center p-component-overlay
                        p-component-overlay-enter p-dialog-visible"
                >
                    <div
                        className="p-dialog p-component max-w-3xl p-dialog-enter p-dialog-enter-active"
                        role="dialog"
                        aria-labelledby=""
                        aria-describedby=""
                        aria-modal="true"
                    >
                        <div className="p-dialog-header">
                            <div className="p-dialog-title">
                                Caption Specifications
                            </div>
                            <div className="p-dialog-header-icons">
                                <button
                                    type="button"
                                    className="p-dialog-header-icon p-dialog-header-close p-link"
                                    aria-label="Close"
                                >
                                    <span className="p-dialog-header-close-icon pi pi-times" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                        <div className="p-dialog-content">
                            <label><strong>Enabled:&nbsp;</strong></label>
                            <label>No</label>
                            <hr className="my-4" />
                            <div style={{ marginTop: "10px" }}>
                                <label><strong>Media Notes:&nbsp;</strong></label>
                                <div className="mc-subspec-freeform-text mc-media-notes" />
                            </div>
                        </div>
                        <div className="p-dialog-footer">
                            <button className="mc-btn mc-btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: false } as CaptionSpecification) as {} as AnyAction
        );
        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionSpecificationsModal show onClose={(): void => undefined} />
            </Provider>
        );

        // THEN
        expect(removeIds(actualNode.html())).toEqual(expectedNode.html());
    });
});
