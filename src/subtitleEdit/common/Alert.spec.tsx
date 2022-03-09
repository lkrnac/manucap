import { render, waitFor } from "@testing-library/react";
import Alert from "./Alert";

describe("Alert", () => {
    it("renders children with show class if show is true", () => {
        // GIVEN
        const expectedNode = render(
            <div className="tw-alert tw-alert-component test-class">
                <div>dummyChild</div>
            </div>
        );

        const expResult = true;

        // WHEN
        const actualNode = render(
            <Alert show={expResult} alertClass="test-class">
                <div>dummyChild</div>
            </Alert>
        );

        // THEN
        expect(actualNode.container.outerHTML).toBe(expectedNode.container.outerHTML);
    });

    it("renders children without show class if show is false", () => {
        // GIVEN
        const expectedNode = render(<></>);

        // WHEN
        const actualNode = render(
            <Alert show={false} alertClass="test-class">
                <div>dummyChild</div>
            </Alert>
        );

        // THEN
        expect(actualNode.container.outerHTML).toBe(expectedNode.container.outerHTML);
    });

    it("renders children with style properties", () => {
        // GIVEN
        const expectedNode = render(
            <div className="tw-alert tw-alert-component test-class" style={{ paddingLeft: 10 }}>
                <div>dummyChild</div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Alert show alertClass="test-class" style={{ paddingLeft: "10px" }}>
                <div>dummyChild</div>
            </Alert>
        );

        // THEN
        expect(actualNode.container.outerHTML).toBe(expectedNode.container.outerHTML);
    });

    it("calls onClose after autoCloseDelay if autoClose is set", async () => {
        // GIVEN
        const onCloseCallback = jest.fn();
        const expResult = true;

        // WHEN
        render(
            <Alert show={expResult} alertClass="test-class" onClose={onCloseCallback} autoClose autoCloseDelay={1}>
                <div>dummyChild</div>
            </Alert>
        );

        // THEN
        await waitFor(() => {
            expect(onCloseCallback).toBeCalled();
        });
    });

});
