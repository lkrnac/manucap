import { ReactElement } from "react";
import { useSelector } from "react-redux";
import { ManuCapState } from "../../manuCapReducers";
import { Track } from "../../model";
import { Tooltip } from "primereact/tooltip";
import { mdiDownload } from "@mdi/js";
import Icon from "@mdi/react";

interface Props {
    handleExport: (editingTrack: Track | null) => void;
}

const ExportTrackCuesButton = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    return (
        <>
            <button
                id="exportFileBtn"
                className="mc-export-button mc-btn mc-btn-light"
                onClick={(): void => props.handleExport(editingTrack)}
                data-pr-tooltip="Export File"
                data-pr-position="top"
                data-pr-at="center+2 top-2"
            >
                <Icon path={mdiDownload} size={1.25} />
            </button>
            <Tooltip
                id="exportFileBtnTooltip"
                target="#exportFileBtn"
            />
        </>
    );
};

export default ExportTrackCuesButton;
