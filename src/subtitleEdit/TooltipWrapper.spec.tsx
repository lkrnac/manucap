import "../testUtils/initBrowserEnvironment";
import React from "react";
import { mount } from "enzyme";
import { TooltipWrapper } from "./TooltipWrapper";

describe("TooltipWrapper", () => {
    let container: HTMLDivElement;
    beforeEach(() => {
        container = document.createElement("div");
    });
    it("renders button for undefined category", () => {
        const actualNode = mount(
            <TooltipWrapper text="This is span" tooltipId="spanId" placement="left">
                <button className="btn">Span</button>
            </TooltipWrapper>,
            { attachTo: container });

        //WHEN
        actualNode.find(".btn").simulate("focus");
        expect( container);
        expect(document.getElementsByClassName("tooltip"));


        // THEN
        expect(actualNode.html())
            .toEqual("");

    });
});
