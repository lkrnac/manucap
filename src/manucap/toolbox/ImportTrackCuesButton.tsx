import { ReactElement } from "react";
import { Tooltip } from "primereact/tooltip";
import Icon from "@mdi/react";
import { mdiImport } from "@mdi/js";

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
                <Icon path={mdiImport} size={1.25} />
            </button>
            <Tooltip
                id="importFileBtnTooltip"
                target="#importFileBtn"
            />
        </>
    );
};

export default ImportTrackCuesButton;
