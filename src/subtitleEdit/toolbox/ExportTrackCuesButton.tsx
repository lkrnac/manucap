import React, { ReactElement } from "react";

interface Props {
    handleExport: () => void;
}

const ExportTrackCuesButton = (props: Props): ReactElement => {
    return (
        <button
            type="button"
            className="sbte-export-button btn btn-secondary"
            onClick={props.handleExport}
        >
            <i className="fas fa-file-export" /> Export File
        </button>
    );
};

export default ExportTrackCuesButton;
