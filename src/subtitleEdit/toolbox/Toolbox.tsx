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
import SyncCuesButton from "./SyncCuesButton";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import SearchReplaceButton from "./SearchReplaceButton";

interface Props {
    handleExportFile: () => void;
    handleImportFile: () => void;
}

const Toolbox = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const editingTask = useSelector((state: SubtitleEditState) => state.cuesTask);
    const isTranslation = editingTrack?.type === "TRANSLATION";
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
                            <ExportTrackCuesButton
                                handleExport={props.handleExportFile}
                            />
                            <ImportTrackCuesButton
                                handleImport={props.handleImportFile}
                                disabled={editingTask?.completed}
                            />
                            <SearchReplaceButton />
                            { isTranslation ? <SyncCuesButton /> : null }
                        </ButtonToolbar>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    );
};

export default Toolbox;
