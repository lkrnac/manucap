import React, { ReactElement } from "react";
import Accordion from "react-bootstrap/Accordion";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Card from "react-bootstrap/Card";
import KeyboardShortcuts from "./KeyboardShortcuts";
import ShiftTimeButton from "./shift/ShiftTimeButton";
import SubtitleSpecificationsButton from "./SubtitleSpecificationsButton";

export interface Props {
    showSubtitleSpecification?: boolean;
}
const Toolbox = (props: Props): ReactElement => {
    return (
        <Accordion defaultActiveKey="0" style={{ marginTop: "10px" }} className="sbte-toolbox">
            <Card>
                <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                    Toolbox
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                    <Card.Body>
                        <ButtonToolbar>
                            <KeyboardShortcuts />
                            <SubtitleSpecificationsButton show={props.showSubtitleSpecification} />
                            <ShiftTimeButton />
                        </ButtonToolbar>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    );
};

Toolbox.defaultProps = {
    showSubtitleSpecification: false
} as Partial<Props>;


export default Toolbox;
