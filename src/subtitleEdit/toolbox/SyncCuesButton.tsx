import React, { ReactElement } from "react";

const SyncCuesButton = (): ReactElement => {
    return (
        <button
            type="button"
            className="sbte-sync-cues-button btn btn-secondary"
        >
            <i className="fas fa-sync" /> Sync Cues
        </button>
    );
};

export default SyncCuesButton;
