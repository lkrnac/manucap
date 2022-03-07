import { ReactElement } from "react";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import { Dropdown } from "react-bootstrap";
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
        <ButtonToolbar className="sbte-button-toolbar" style={{ marginTop: "20px" }}>
            <SubtitleSpecificationsButton />
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
                <Dropdown.Toggle id="cue-line-category" variant="secondary">
                    <i className="fas fa-ellipsis-h" />
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ minWidth: "220px", width: "220px" }}>
                    <Dropdown.Item className="sbte-dropdown-item">
                        <KeyboardShortcuts />
                    </Dropdown.Item>
                    <Dropdown.Item className="sbte-dropdown-item">
                        <ShiftTimeButton />
                    </Dropdown.Item>
                    <Dropdown.Item className="sbte-dropdown-item">
                        <CaptionOverlapToggle />
                    </Dropdown.Item>
                    <Dropdown.Item className="sbte-dropdown-item">
                        <MergeCuesButton />
                    </Dropdown.Item>
                    <Dropdown.Item className="sbte-dropdown-item">
                        <CueCommentsToggle />
                    </Dropdown.Item>
                    <Dropdown.Item className="sbte-dropdown-item">
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
    );
};

export default Toolbox;
