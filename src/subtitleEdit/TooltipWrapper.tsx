import React, { ReactElement } from "react";
import { OverlayTrigger, Tooltip, Popover } from "react-bootstrap";

interface Props {
    text: string;
    trigger?: "click" | "focus" | "hover" |  string[] | undefined;
    placement: "auto-start"| "auto" | "auto-end" | "top-start" | "top"
        | "top-end" | "right-start"| "right"| "right-end"| "bottom-end"
        | "bottom" | "bottom-start" | "left-end" | "left" | "left-start";
    tooltipId: string;
    children: React.ReactElement;
    popover?: boolean;
}
export const TooltipWrapper = (props: Props): ReactElement => {

    return (
        <OverlayTrigger
            // @ts-ignore ignores type of trigger, passing strings instead
            trigger={props.trigger || ["hover", "focus"]}
            placement={props.placement}
            delay={{ show: 600, hide: 100 }}
            overlay={
                props.popover ?
                    <Popover id={props.tooltipId}>
                        <Popover.Content>
                            {props.text}
                        </Popover.Content>
                    </Popover>
                    :
                    <Tooltip id={props.tooltipId}>{props.text}</Tooltip>
            }
        >
            {props.children}
        </OverlayTrigger>
    );

};
