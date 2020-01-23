import { Position, PositionIcon, findPositionIcon, positionIcons } from "./cueUtils";
import React, { ReactElement } from "react";
import { Dropdown } from "react-bootstrap";

interface Props {
    cue: VTTCue;
    changePosition: (position: Position) => void;
}

const PositionButton = (props: Props): ReactElement => (
    <Dropdown style={{ marginBottom: "5px", marginRight: "10px" }}>
        <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
            {findPositionIcon(props.cue).iconText} <span className="caret" />
        </Dropdown.Toggle>
        <Dropdown.Menu style={{ minWidth: "210px", width: "210px" }}>
            <div style={{ display: "flex", flexFlow: "row wrap" }}>
                {
                    positionIcons.map((positionIcon: PositionIcon, index: number): ReactElement =>
                        (
                            <Dropdown.Item
                                key={index}
                                className="sbte-position-button btn btn-outline-secondary"
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
