import React, { ReactElement } from "react";

interface Props {
    handleExport: () => void;
}

const ExportSourceTrackCuesButton = (props: Props): ReactElement => {
    return (
        <button
            type="button"
            className="sbte-export-source-button btn btn-secondary"
            onClick={(): void => props.handleExport()}
        >
            <i className="fas fa-file-export" /> Export Source File
        </button>
    );
};

export default ExportSourceTrackCuesButton;
