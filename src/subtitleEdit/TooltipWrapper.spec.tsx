/**  * @jest-environment jsdom-sixteen  */
// TODO Remove above when we update to react-scripts with Jest 26:
// https://github.com/facebook/create-react-app/pull/8362
// eslint-disable-next-line
// https://stackoverflow.com/questions/61036156/react-typescript-testing-typeerror-mutationobserver-is-not-a-constructor#comment110029314_61039444

import "../testUtils/initBrowserEnvironment";
import React from "react";
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
            findByTextIgnoreTags("Tooltip with bold text", node));
        expect(tooltip).toBeInTheDocument();
    });
});
