import { findPositionIcon, Position, PositionIcon, positionIcons } from "../cueUtils";
import React, { ReactElement } from "react";
import { Dropdown } from "react-bootstrap";
import { TooltipWrapper } from "../../TooltipWrapper";

interface Props {
    vttCue: VTTCue;
    changePosition: (position: Position) => void;
}

const PositionButton = (props: Props): ReactElement => (
    <Dropdown style={{ marginBottom: "5px", marginRight: "10px" }}>
        <TooltipWrapper
            tooltipId="postionBtnTooltip"
            text="Set where to set the subtitle line on the video screen"
            placement="top"
        >
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                {findPositionIcon(props.vttCue).iconText} <span className="caret" />
            </Dropdown.Toggle>
        </TooltipWrapper>
        <Dropdown.Menu style={{ minWidth: "210px", width: "210px" }}>
            <div style={{ display: "flex", flexFlow: "row wrap" }}>
                {
                    positionIcons.map((positionIcon: PositionIcon, index: number): ReactElement =>
                        (
                            <Dropdown.Item
                                key={index}
                                className="btn btn-outline-secondary"
                                style={{
                                    lineHeight: "38px",
                                    width: "38px",
                                    margin: "auto",
                                    padding: "0px",
                                    paddingLeft: positionIcon.leftPadding
                                }}
                                onClick={(): void => props.changePosition(positionIcon.position)}
                            >
                                {positionIcon.iconText}
                            </Dropdown.Item>
                        )
                    )
                }
            </div>
        </Dropdown.Menu>
    </Dropdown>
);

export default PositionButton;
