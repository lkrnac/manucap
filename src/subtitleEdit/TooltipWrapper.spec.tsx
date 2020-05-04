import "../testUtils/initBrowserEnvironment";
import React from "react";
import { mount } from "enzyme";
import { TooltipWrapper } from "./TooltipWrapper";

describe("TooltipWrapper", () => {
    it("renders overlay", () => {
        //WHEN
        const actualNode = mount(
            <TooltipWrapper
                text="This is span"
                tooltipId="spanId"
                placement="left"
                trigger={["hover", "focus"]}
            >
                <button className="btn">Span</button>
            </TooltipWrapper>,
                { attachTo: document.body }
            );

        //THEN
        expect(actualNode.find("OverlayTrigger")).toHaveLength(1);
    });
});
