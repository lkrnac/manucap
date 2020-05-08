import React, { ReactElement } from "react";
import Accordion from "react-bootstrap/Accordion";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Card from "react-bootstrap/Card";
import KeyboardShortcuts from "./KeyboardShortcuts";
import ShiftTimeButton from "./shift/ShiftTimeButton";
import SubtitleSpecificationsButton from "./SubtitleSpecificationsButton";
import CaptionOverlapToggle from "./CaptionOverlapToggle";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import { Track } from "../model";

const Toolbox = (): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const track = editingTrack ? editingTrack : {} as Track;
    return (
        <Accordion defaultActiveKey="0" style={{ marginTop: "10px" }} className="sbte-toolbox">
            <Card>
                <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                    Toolbox
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                    <Card.Body>
                        <ButtonToolbar className="sbte-button-toolbar">
                            <KeyboardShortcuts />
                            <SubtitleSpecificationsButton />
                            <ShiftTimeButton />
                            {
                                track.type !== "TRANSLATION" ? <CaptionOverlapToggle /> : null
                            }
                        </ButtonToolbar>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    );
};

export default Toolbox;
