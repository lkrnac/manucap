import { ReactElement } from "react";
import { Tooltip } from "primereact/tooltip";

interface Props {
    handleImport: () => void;
    disabled?: boolean;
}

const ImportTrackCuesButton = (props: Props): ReactElement => {
    return (
        <>
            <button
                id="importFileBtn"
                disabled={props.disabled}
                className="mc-import-button mc-btn mc-btn-light"
                onClick={(): void => props.handleImport()}
                data-pr-tooltip="Import File"
                data-pr-position="top"
                data-pr-at="center+2 top-2"
            >
                <i className="fa-duotone fa-file-import fa-lg" />
            </button>
            <Tooltip
                id="importFileBtnTooltip"
                target="#importFileBtn"
            />
        </>
    );
};

export default ImportTrackCuesButton;
