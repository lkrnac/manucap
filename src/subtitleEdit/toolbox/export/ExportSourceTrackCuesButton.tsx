import { ReactElement } from "react";
import Tooltip from "../../common/Tooltip";

interface Props {
    handleExport: () => void;
}

const ExportSourceTrackCuesButton = (props: Props): ReactElement => {
    return (
        <Tooltip
            tooltipId="exportSourceFileBtnTooltip"
            message="Export Source File"
            offset={[-7, 10]}
        >
            <button
                type="button"
                className="sbte-export-source-button btn btn-secondary"
                onClick={(): void => props.handleExport()}
            >
                <i className="fas fa-file-export fa-lg" />
            </button>
        </Tooltip>
    );
};

export default ExportSourceTrackCuesButton;
