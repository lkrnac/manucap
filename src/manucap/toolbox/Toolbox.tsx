import { MouseEvent, ReactElement, useRef, useState } from "react";
import KeyboardShortcuts from "./keyboardShortcuts/KeyboardShortcuts";
import ShiftTimeButton from "./shift/ShiftTimeButton";
import CaptionSpecificationsButton from "./captionSpecifications/CaptionSpecificationsButton";
import CaptionOverlapToggle from "./CaptionOverlapToggle";
import ExportTrackCuesButton from "./export/ExportTrackCuesButton";
import ImportTrackCuesButton from "./ImportTrackCuesButton";
import { useSelector } from "react-redux";
import { ManuCapState } from "../manuCapReducers";
import SearchReplaceButton from "./SearchReplaceButton";
import MergeCuesButton from "./MergeCuesButton";
import ExportSourceTrackCuesButton from "./export/ExportSourceTrackCuesButton";
import CueCommentsToggle from "./CueCommentsToggle";
import WaveformToggle from "./WaveformToggle";
import TimecodesLockToggle from "./TimecodesLockToggle";
import SyncCuesButton from "./SyncCuesButton";
import { Menu } from "primereact/menu";
import KeyboardShortcutsModal from "./keyboardShortcuts/KeyboardShortcutsModal";
import ShiftTimeModal from "./shift/ShiftTimeModal";
import { SaveState, Track } from "../model";
import { mdiDotsHorizontal } from "@mdi/js";
import Icon from "@mdi/react";

interface Props {
    handleExportFile: (trackVersionExport: Track | null) => void;
    handleExportSourceFile: () => void;
    handleImportFile: () => void;
    editDisabled?: boolean;
    saveState: SaveState;
}

const Toolbox = (props: Props): ReactElement => {

    // Tracks.

    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    const isTranslation = !!editingTrack?.sourceLanguage;

    // Menu Toolbox.

    const menu = useRef<Menu>(null);
    const toggleMenu = (event: MouseEvent<HTMLElement>) => {
        if (menu.current) {
            menu.current.toggle(event);
        }
    };

    // Modal states.

    const [showShiftTimeModal, setShiftTimeModal] = useState<boolean>(false);
    const [showKbModal, setKbModal] = useState<boolean>(false);

    return (
        <div
            className="mt-6 space-x-2 flex items-stretch
                z-100 justify-center mc-button-toolbar"
        >
            <CaptionSpecificationsButton />
            <SearchReplaceButton />
            <ImportTrackCuesButton
                handleImport={props.handleImportFile}
                disabled={props.editDisabled}
            />
            {isTranslation ? (
                <ExportSourceTrackCuesButton handleExport={props.handleExportSourceFile} />
            ) : null}
            <ExportTrackCuesButton
                handleExport={props.handleExportFile}
            />
            <button
                className="select-none mc-dropdown-toggle mc-btn mc-btn-light flex
                    items-center justify-center"
                onClick={toggleMenu}
                aria-controls="toolboxMenu"
                aria-haspopup
            >
                <Icon path={mdiDotsHorizontal} size={1.25} />
            </button>
            <Menu
                id="toolboxMenu"
                className="mc-big-menu"
                appendTo={document.body.querySelector("#prime-react-dialogs") as HTMLDivElement}
                ref={menu}
                popup
                model={[
                    { template: () => <KeyboardShortcuts show setShow={setKbModal} /> },
                    { separator: true },
                    { template: () => <ShiftTimeButton onClick={() => setShiftTimeModal(true)} /> },
                    { template: () => <SyncCuesButton onClick={toggleMenu} /> },
                    { template: () => <MergeCuesButton onClick={toggleMenu} /> },
                    { separator: true },
                    { template: () => <TimecodesLockToggle onClick={toggleMenu} /> },
                    { template: () => <CaptionOverlapToggle onClick={toggleMenu} saveState={props.saveState} /> },
                    { separator: true },
                    { template: () => <CueCommentsToggle onClick={toggleMenu} /> },
                    { template: () => <WaveformToggle onClick={toggleMenu} /> },
                ]}
            />
            <ShiftTimeModal
                show={showShiftTimeModal}
                onClose={() => setShiftTimeModal(false)}
            />
            <KeyboardShortcutsModal
                show={showKbModal}
                onClose={() => setKbModal(false)}
            />
        </div>
    );
};

export default Toolbox;
