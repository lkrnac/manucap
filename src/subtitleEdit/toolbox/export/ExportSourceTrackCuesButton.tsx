import { ReactElement } from "react";
import { TooltipWrapper } from "../../TooltipWrapper";

interface Props {
    handleExport: () => void;
}

const ExportSourceTrackCuesButton = (props: Props): ReactElement => {
    return (
        <TooltipWrapper
            tooltipId="exportSourceFileBtnTooltip"
            text="Export Source File"
            placement="auto"
        >
            <button
                type="button"
                className="sbte-export-source-button btn btn-secondary"
                onClick={(): void => props.handleExport()}
            >
                <i className="fas fa-file-export fa-lg" />
            </button>
        </TooltipWrapper>
    );
};

export default ExportSourceTrackCuesButton;
