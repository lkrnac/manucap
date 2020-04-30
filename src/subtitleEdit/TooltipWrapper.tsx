import React, { ReactElement } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

interface Props {
    text: string;
    trigger?: "click" | "focus" | "hover" | undefined;
    placement: "auto-start"| "auto" | "auto-end" | "top-start" | "top"
        | "top-end" | "right-start"| "right"| "right-end"| "bottom-end"
        | "bottom" | "bottom-start" | "left-end" | "left" | "left-start";
    tooltipId: string;
    children: React.ReactNode;

}
export const TooltipWrapper = (props: Props): ReactElement => {
    return (
        <OverlayTrigger
            trigger={props.trigger || ["hover", "focus"]}
            placement={props.placement}
            delay={{ show: 100, hide: 100 }}
            overlay={<Tooltip id={props.tooltipId}>{props.text}</Tooltip>}
        >
            {props.children}
        </OverlayTrigger>
    );

};
