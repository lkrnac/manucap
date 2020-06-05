import React, { ReactElement } from "react";
import Accordion from "react-bootstrap/Accordion";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Card from "react-bootstrap/Card";
import KeyboardShortcuts from "./KeyboardShortcuts";
import ShiftTimeButton from "./shift/ShiftTimeButton";
import SubtitleSpecificationsButton from "./SubtitleSpecificationsButton";
import CaptionOverlapToggle from "./CaptionOverlapToggle";
import ExportTrackCuesButton from "./ExportTrackCuesButton";
import ImportTrackCuesButton from "./ImportTrackCuesButton";

interface Props {
    handleExportFile: () => void;
    handleImportFile: () => void;
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
                        <ButtonToolbar className="sbte-button-toolbar">
                            <KeyboardShortcuts />
                            <SubtitleSpecificationsButton />
                            <ShiftTimeButton />
                            <CaptionOverlapToggle />
                            <ExportTrackCuesButton handleExport={props.handleExportFile} />
                            <ImportTrackCuesButton handleImport={props.handleImportFile} />
                        </ButtonToolbar>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    );
};

export default Toolbox;
