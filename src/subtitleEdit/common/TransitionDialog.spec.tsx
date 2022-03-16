import "../../testUtils/initBrowserEnvironment";
import TransitionDialog from "./TransitionDialog";
import { render, fireEvent } from "@testing-library/react";
import { renderWithHeadlessPortal, getHeadlessDialog, removeHeadlessAttributes } from "../../testUtils/testUtils";

describe("TransitionDialog", () => {
    afterEach(() => {
        // Cleaning JSDOM after each test. Otherwise, it may create inconsistency on tests.
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    it("does not render on closed prop", () => {
        // WHEN
        const actualNode = renderWithHeadlessPortal(
            <TransitionDialog open={false}>
                <span>This is a test</span>
            </TransitionDialog>
        );

        // THEN
        expect(getHeadlessDialog(actualNode)).toBeNull();
    });

    it("renders on open prop", () => {
        // GIVEN
        const actualNode = renderWithHeadlessPortal(
            <TransitionDialog onClose={jest.fn()} open>
                <span>This is a test</span>
            </TransitionDialog>
        );

        // WHEN
        const expectedNode = render(
            <div
                className="tw-fixed tw-z-200 tw-inset-0 tw-overflow-y-auto tw-modal"
                id=""
                role="dialog"
                aria-modal="true"
                aria-labelledby=""
                aria-describedby=""
            >
                <div
                    className="tw-fixed tw-inset-0 tw-bg-black"
                    id=""
                    aria-hidden="true"
                />
                <div className="tw-flex tw-items-center tw-justify-center tw-p-6 tw-min-h-screen">
                    <div className="tw-relative tw-max-w-2xl tw-w-full tw-mx-auto tw-shadow-2xl tw-modal-content">
                        <button
                            type="button"
                            className="tw-modal-close"
                            tabIndex={0}
                        >
                            <span aria-hidden="true">×</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <div className="tw-modal-header tw-modal-header-primary">
                            <h4 id="" />
                        </div>
                        <div className="tw-modal-description" id="">
                            <span>This is a test</span>
                        </div>
                    </div>
                </div>
            </div>
        );

        // THEN
        const actual = removeHeadlessAttributes(getHeadlessDialog(actualNode).outerHTML);
        const expected = removeHeadlessAttributes(getHeadlessDialog(expectedNode).outerHTML);
        expect(actual).toBe(expected);
    });

    it("renders with custom dialogClassName", () => {
        // GIVEN
        const actualNode = renderWithHeadlessPortal(
            <TransitionDialog onClose={jest.fn()} open dialogClassName="test-custom-dialog">
                <span>This is a test</span>
            </TransitionDialog>
        );

        // WHEN
        const expectedNode = render(
            <div
                className="tw-fixed tw-z-200 tw-inset-0 tw-overflow-y-auto tw-modal test-custom-dialog"
                id=""
                role="dialog"
                aria-modal="true"
                aria-labelledby=""
                aria-describedby=""
            >
                <div
                    className="tw-fixed tw-inset-0 tw-bg-black"
                    id=""
                    aria-hidden="true"
                />
                <div className="tw-flex tw-items-center tw-justify-center tw-p-6 tw-min-h-screen">
                    <div className="tw-relative tw-max-w-2xl tw-w-full tw-mx-auto tw-shadow-2xl tw-modal-content">
                        <button
                            type="button"
                            className="tw-modal-close"
                            tabIndex={0}
                        >
                            <span aria-hidden="true">×</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <div className="tw-modal-header tw-modal-header-primary">
                            <h4 id="" />
                        </div>
                        <div className="tw-modal-description" id="">
                            <span>This is a test</span>
                        </div>
                    </div>
                </div>
            </div>
        );

        // THEN
        const actual = removeHeadlessAttributes(getHeadlessDialog(actualNode).outerHTML);
        const expected = removeHeadlessAttributes(getHeadlessDialog(expectedNode).outerHTML);
        expect(actual).toBe(expected);
    });

    it("renders with custom contentClassName", () => {
        // GIVEN
        const actualNode = renderWithHeadlessPortal(
            <TransitionDialog onClose={jest.fn()} open contentClassname="test-custom-dialog">
                <span>This is a test</span>
            </TransitionDialog>
        );

        // WHEN
        const expectedNode = render(
            <div
                className="tw-fixed tw-z-200 tw-inset-0 tw-overflow-y-auto tw-modal"
                id=""
                role="dialog"
                aria-modal="true"
                aria-labelledby=""
                aria-describedby=""
            >
                <div
                    className="tw-fixed tw-inset-0 tw-bg-black"
                    id=""
                    aria-hidden="true"
                />
                <div className="tw-flex tw-items-center tw-justify-center tw-p-6 tw-min-h-screen">
                    <div
                        className="tw-relative tw-max-w-2xl tw-w-full tw-mx-auto
                            tw-shadow-2xl tw-modal-content test-custom-dialog"
                    >
                        <button
                            type="button"
                            className="tw-modal-close"
                            tabIndex={0}
                        >
                            <span aria-hidden="true">×</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <div className="tw-modal-header tw-modal-header-primary">
                            <h4 id="" />
                        </div>
                        <div className="tw-modal-description" id="">
                            <span>This is a test</span>
                        </div>
                    </div>
                </div>
            </div>
        );

        // THEN
        const actual = removeHeadlessAttributes(getHeadlessDialog(actualNode).outerHTML);
        const expected = removeHeadlessAttributes(getHeadlessDialog(expectedNode).outerHTML);
        expect(actual).toBe(expected);
    });

    it("renders with custom headerClassName", () => {
        // GIVEN
        const actualNode = renderWithHeadlessPortal(
            <TransitionDialog onClose={jest.fn()} open headerClassName="test-custom-dialog">
                <span>This is a test</span>
            </TransitionDialog>
        );

        // WHEN
        const expectedNode = render(
            <div
                className="tw-fixed tw-z-200 tw-inset-0 tw-overflow-y-auto tw-modal"
                id=""
                role="dialog"
                aria-modal="true"
                aria-labelledby=""
                aria-describedby=""
            >
                <div
                    className="tw-fixed tw-inset-0 tw-bg-black"
                    id=""
                    aria-hidden="true"
                />
                <div className="tw-flex tw-items-center tw-justify-center tw-p-6 tw-min-h-screen">
                    <div
                        className="tw-relative tw-max-w-2xl tw-w-full tw-mx-auto
                            tw-shadow-2xl tw-modal-content"
                    >
                        <button
                            type="button"
                            className="tw-modal-close"
                            tabIndex={0}
                        >
                            <span aria-hidden="true">×</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <div className="tw-modal-header tw-modal-header-primary test-custom-dialog">
                            <h4 id="" />
                        </div>
                        <div className="tw-modal-description" id="">
                            <span>This is a test</span>
                        </div>
                    </div>
                </div>
            </div>
        );

        // THEN
        const actual = removeHeadlessAttributes(getHeadlessDialog(actualNode).outerHTML);
        const expected = removeHeadlessAttributes(getHeadlessDialog(expectedNode).outerHTML);
        expect(actual).toBe(expected);
    });

    it("renders without close button", () => {
        // GIVEN
        const actualNode = renderWithHeadlessPortal(
            <TransitionDialog
                onClose={jest.fn()}
                open
                hideCloseButton
            >
                <span>This is a test</span>
            </TransitionDialog>
        );

        // WHEN
        const expectedNode = render(
            <div
                className="tw-fixed tw-z-200 tw-inset-0 tw-overflow-y-auto tw-modal"
                id=""
                role="dialog"
                aria-modal="true"
                aria-labelledby=""
                aria-describedby=""
            >
                <div
                    className="tw-fixed tw-inset-0 tw-bg-black"
                    id=""
                    aria-hidden="true"
                />
                <div className="tw-flex tw-items-center tw-justify-center tw-p-6 tw-min-h-screen">
                    <div
                        className="tw-relative tw-max-w-2xl tw-w-full tw-mx-auto
                            tw-shadow-2xl tw-modal-content"
                    >
                        <div className="tw-modal-header tw-modal-header-primary">
                            <h4 id="" />
                        </div>
                        <div className="tw-modal-description" id="">
                            <span>This is a test</span>
                        </div>
                    </div>
                </div>
            </div>
        );

        // THEN
        const actual = removeHeadlessAttributes(getHeadlessDialog(actualNode).outerHTML);
        const expected = removeHeadlessAttributes(getHeadlessDialog(expectedNode).outerHTML);
        expect(actual).toBe(expected);
    });

    it("calls on close on modal exit", () => {
        // GIVEN
        const onClose = jest.fn();
        const actualNode = renderWithHeadlessPortal(
            <TransitionDialog onClose={onClose} open contentClassname="test-custom-dialog">
                <span>This is a test</span>
            </TransitionDialog>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".tw-modal-close") as Element);

        // THEN
        expect(onClose).toBeCalled();
    });
});
