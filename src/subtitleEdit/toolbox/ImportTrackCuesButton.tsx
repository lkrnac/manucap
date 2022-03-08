import { ReactElement } from "react";
import { TooltipWrapper } from "../TooltipWrapper";

interface Props {
    handleImport: () => void;
    disabled?: boolean;
}

const ImportTrackCuesButton = (props: Props): ReactElement => {
    return (
        <TooltipWrapper
            tooltipId="importFileBtnTooltip"
            text="Import File"
            placement="bottom"
        >
            <button
                type="button"
                disabled={props.disabled}
                className="sbte-import-button btn btn-secondary"
                onClick={(): void => props.handleImport()}
            >
                <i className="fas fa-file-import fa-lg" />
            </button>
        </TooltipWrapper>
    );
};

export default ImportTrackCuesButton;
