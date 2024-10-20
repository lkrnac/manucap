import { ReactElement } from "react";
import { Tooltip } from "primereact/tooltip";
import { mdiExport } from "@mdi/js";
import Icon from "@mdi/react";

interface Props {
    handleExport: () => void;
}

const ExportSourceTrackCuesButton = (props: Props): ReactElement => {
    return (
        <>
            <button
                id="exportSourceFileBtn"
                type="button"
                className="mc-export-source-button mc-btn mc-btn-light"
                onClick={(): void => props.handleExport()}
                data-pr-tooltip="Export Source File"
                data-pr-position="top"
                data-pr-at="center+2 top-2"
            >
                <Icon path={mdiExport} size={1.25} />
            </button>
            <Tooltip
                id="exportSourceFileBtn"
                target="#exportSourceFileBtn"
            />
        </>
    );
};

export default ExportSourceTrackCuesButton;
