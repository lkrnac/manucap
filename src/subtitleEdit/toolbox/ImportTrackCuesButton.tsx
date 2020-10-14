import React, { ReactElement } from "react";

interface Props {
    handleImport: () => void;
    disabled?: boolean;
}

const ImportTrackCuesButton = (props: Props): ReactElement => {
    return (
        <button
            type="button"
            disabled={props.disabled}
            className="sbte-import-button btn btn-secondary"
            onClick={(): void => props.handleImport()}
        >
            <i className="fas fa-file-import" /> Import File
        </button>
    );
};

export default ImportTrackCuesButton;
