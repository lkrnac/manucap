import { ReactElement } from "react";
import Tooltip from "../common/Tooltip";

interface Props {
    handleImport: () => void;
    disabled?: boolean;
}

const ImportTrackCuesButton = (props: Props): ReactElement => {
    return (
        <Tooltip
            tooltipId="importFileBtnTooltip"
            message="Import File"
        >
            <button
                type="button"
                disabled={props.disabled}
                className="sbte-import-button btn btn-secondary"
                onClick={(): void => props.handleImport()}
            >
                <i className="fas fa-file-import fa-lg" />
            </button>
        </Tooltip>
    );
};

export default ImportTrackCuesButton;
