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
            tooltipId="exportToolboxBtnTooltip"
            text="Export File"
            placement="right"
        >
            <button
                type="button"
                className="sbte-export-button btn"
                onClick={(): void => props.handleExport(editingTrack)}
            >
                <i className="fa-duotone fa-file-export fa-2x" />
            </button>
        </TooltipWrapper>
    );
};

export default ExportTrackCuesButton;
