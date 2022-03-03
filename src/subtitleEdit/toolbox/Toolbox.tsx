import { ReactElement } from "react";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import { Dropdown } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import KeyboardShortcuts from "./keyboardShortcuts/KeyboardShortcuts";
import ShiftTimeButton from "./shift/ShiftTimeButton";
import SubtitleSpecificationsButton from "./subtitleSpecifications/SubtitleSpecificationsButton";
import CaptionOverlapToggle from "./CaptionOverlapToggle";
import ExportTrackCuesButton from "./export/ExportTrackCuesButton";
import ImportTrackCuesButton from "./ImportTrackCuesButton";
import SyncCuesButton from "./SyncCuesButton";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import SearchReplaceButton from "./SearchReplaceButton";
import MergeCuesButton from "./MergeCuesButton";
import ExportSourceTrackCuesButton from "./export/ExportSourceTrackCuesButton";
import CueCommentsToggle from "./CueCommentsToggle";
import TimecodesLockToggle from "./TimecodesLockToggle";
import WaveformToggle from "./WaveformToggle";

interface Props {
    handleExportFile: () => void;
    handleExportSourceFile: () => void;
    handleImportFile: () => void;
}

const Toolbox = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const editingTask = useSelector((state: SubtitleEditState) => state.cuesTask);
    const isTranslation = editingTrack?.type === "TRANSLATION";
    return (
        <Card>
            <Card.Body>
                <ButtonToolbar className="sbte-button-toolbar">
                    <SearchReplaceButton />
                    <ImportTrackCuesButton
                        handleImport={props.handleImportFile}
                        disabled={editingTask?.editDisabled}
                    />
                    { isTranslation ?
                        <ExportSourceTrackCuesButton handleExport={props.handleExportSourceFile} /> : null }
                    <ExportTrackCuesButton
                        handleExport={props.handleExportFile}
                    />

                    <Dropdown>
                        <Dropdown.Toggle id="cue-line-category" variant="outline-secondary">
                            <i className="fas fa-ellipsis-h" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item className="sbte-dropdown-item" style={{ padding: "8px 24px" }}>
                                <KeyboardShortcuts />
                            </Dropdown.Item>
                            <Dropdown.Item className="sbte-dropdown-item" style={{ padding: "8px 24px" }}>
                                <SubtitleSpecificationsButton />
                            </Dropdown.Item>
                            <Dropdown.Item className="sbte-dropdown-item" style={{ padding: "8px 24px" }}>
                                <ShiftTimeButton />
                            </Dropdown.Item>
                            <Dropdown.Item className="sbte-dropdown-item" style={{ padding: "8px 24px" }}>
                                <CaptionOverlapToggle />
                            </Dropdown.Item>
                            <Dropdown.Item className="sbte-dropdown-item" style={{ padding: "8px 24px" }}>
                                <MergeCuesButton />
                            </Dropdown.Item>
                            <Dropdown.Item className="sbte-dropdown-item" style={{ padding: "8px 24px" }}>
                                <CueCommentsToggle />
                            </Dropdown.Item>
                            <Dropdown.Item className="sbte-dropdown-item" style={{ padding: "8px 24px" }}>
                                <WaveformToggle />
                            </Dropdown.Item>
                            { isTranslation
                                ?
                                    <>
                                        <Dropdown.Item className="sbte-dropdown-item">
                                            <SyncCuesButton />
                                        </Dropdown.Item>
                                        <Dropdown.Item className="sbte-dropdown-item">
                                            <TimecodesLockToggle />
                                        </Dropdown.Item>
                                    </>
                                : null}

                        </Dropdown.Menu>
                    </Dropdown>
                </ButtonToolbar>
            </Card.Body>
        </Card>
    );
};

export default Toolbox;
