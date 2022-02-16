import "../testUtils/initBrowserEnvironment";
import { TooltipWrapper } from "./TooltipWrapper";
import { fireEvent, render } from "@testing-library/react";
import { findByTextIgnoreTags } from "../testUtils/testUtils";

describe("TooltipWrapper", () => {
    it("renders overlay", async () => {
        //WHEN
        const actualNode = render(
            <TooltipWrapper
                text="This is a tooltip"
                tooltipId="testId"
                placement="left"
                trigger={["hover", "focus"]}
            >
                <button className="btn">Span</button>
            </TooltipWrapper>
        );

        fireEvent.mouseOver(actualNode.container.querySelector(".btn") as Element);

        // THEN
        const tooltip = await actualNode.findByText("This is a tooltip");
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveClass("tooltip-inner");
    });

    it("renders overlay with popover", async () => {
        //WHEN
        const actualNode = render(
            <TooltipWrapper
                text="This is a popover"
                tooltipId="testId"
                placement="left"
                trigger={["hover", "focus"]}
                bsPrefix="dummyPopover"
                popover
            >
                <button className="btn">Span</button>
            </TooltipWrapper>
        );

        fireEvent.mouseOver(actualNode.container.querySelector(".btn") as Element);

        // THEN
        const popover = await actualNode.findByText("This is a popover");
        expect(popover).toBeInTheDocument();
        expect(popover).toHaveClass("popover-body");
        expect(document.querySelector(".dummyPopover")).toBeInTheDocument();
    });

    it("renders with html", async () => {
        //WHEN
        const actualNode = render(
            <TooltipWrapper
                text={<span>Tooltip with <strong>bold text</strong></span>}
                tooltipId="testId"
                placement="left"
                trigger={["hover", "focus"]}
            >
                <button className="btn">Span</button>
            </TooltipWrapper>
        );

        fireEvent.mouseOver(actualNode.container.querySelector(".btn") as Element);

        // THEN
        const tooltip = await actualNode.findByText((_content, node) =>
            // @ts-ignore we can ignore the fact that node may be null for findByTextIgnoreTags is only used in tests
            findByTextIgnoreTags("Tooltip with bold text", node));
        expect(tooltip).toBeInTheDocument();
    });

    it("renders with auto show", async () => {
        //WHEN
        const actualNode = render(
            <TooltipWrapper
                text="This is a tooltip"
                tooltipId="testId"
                placement="left"
                trigger={["hover", "focus"]}
                show
            >
                <button className="btn">Span</button>
            </TooltipWrapper>
        );

        // THEN
        const tooltip = await actualNode.findByText("This is a tooltip");
        expect(tooltip).toBeInTheDocument();
    });
});
