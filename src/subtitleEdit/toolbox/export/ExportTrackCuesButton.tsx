import { ReactElement } from "react";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { Track } from "../../model";
import { TooltipWrapper } from "../../TooltipWrapper";

interface Props {
    handleExport: (editingTrack: Track | null) => void;
}

const ExportTrackCuesButton = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    return (
        <TooltipWrapper
            tooltipId="exportFileBtnTooltip"
            text="Export File"
            placement="auto"
        >
            <button
                type="button"
                className="sbte-export-button btn btn-secondary"
                onClick={(): void => props.handleExport(editingTrack)}
            >
                <i className="fas fa-file-download fa-lg" />
            </button>
        </TooltipWrapper>
    );
};

export default ExportTrackCuesButton;
