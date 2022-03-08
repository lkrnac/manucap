import { ReactElement } from "react";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { Track } from "../../model";
import Tooltip from "../../common/Tooltip";

interface Props {
    handleExport: (editingTrack: Track | null) => void;
}

const ExportTrackCuesButton = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    return (
        <Tooltip
            tooltipId="exportFileBtnTooltip"
            message="Export File"
        >
            <button
                type="button"
                className="sbte-export-button btn btn-secondary"
                onClick={(): void => props.handleExport(editingTrack)}
            >
                <i className="fas fa-file-download fa-lg" />
            </button>
        </Tooltip>
    );
};

export default ExportTrackCuesButton;
