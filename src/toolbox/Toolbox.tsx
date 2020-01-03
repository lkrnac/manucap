import React, {
    ReactElement
} from "react";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import KeyboardShortcuts from "../subtitleEdit/KeyboardShortcuts";
import SubtitleSpecifications from "./SubtitleSpecifications";
// import TimeEditor from "./TimeEditor";

const Toolbox = (): ReactElement => {
    return (
        <Accordion defaultActiveKey="0" style={{ marginTop: "10px"}}>
            <Card>
                <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                    Toolbox
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                    <Card.Body>
                        <ButtonToolbar>
                            <KeyboardShortcuts />
                            <SubtitleSpecifications />
                        </ButtonToolbar>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    );
};

export default Toolbox;
