import "../../../testUtils/initBrowserEnvironment";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { SubtitleSpecification } from "../model";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import { mount } from "enzyme";
import { readSubtitleSpecification } from "./subtitleSpecificationSlice";
import testingStore from "../../../testUtils/testingStore";
import { removeHeadlessAttributes } from "../../../testUtils/testUtils";

describe("SubtitleSpecificationsModal", () => {
    it("renders shown", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div
                    className="tw-fixed tw-z-200 tw-inset-0 tw-overflow-y-auto tw-modal sbte-medium-modal"
                    id=""
                    role="dialog"
                    aria-modal
                    aria-labelledby=""
                    aria-describedby=""
                >
                    <div
                        className="tw-fixed tw-inset-0 tw-bg-black"
                        id=""
                        aria-hidden
                    />
                    <div className="tw-flex tw-items-center tw-justify-center tw-p-6 tw-min-h-screen">
                        <div
                            className="tw-relative tw-max-w-2xl tw-w-full tw-mx-auto tw-shadow-2xl
                                tw-modal-content tw-max-w-3xl"
                        >
                            <button type="button" className="tw-modal-close">
                                <span aria-hidden="true">×</span>
                                <span className="sr-only">Close</span>
                            </button>
                            <div className="tw-modal-header tw-modal-header-primary">
                                <h4 id="">Subtitle Specifications</h4>
                            </div>
                            <div className="tw-modal-description" id="">
                                <label><strong>Enabled:&nbsp;</strong></label><label>No</label>
                                <div className="tw-modal-toolbar">
                                    <button
                                        className="btn btn-primary dotsub-subtitle-specifications-modal-close-button"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsModal show onClose={(): void => undefined} />
            </Provider>
        );

        // THEN
        const actual = removeHeadlessAttributes(actualNode.html());
        const expected = removeHeadlessAttributes(expectedNode.html());
        expect(actual).toEqual(expected);
    });
});
