import React, { ReactElement } from "react";
import {useSelector} from "react-redux";
import {SubtitleEditState} from "../subtitleEditReducers";
import {Track} from "../model";

interface Props {
    handleExport: (editingTrack: Track | null) => void;
}

const ExportTrackCuesButton = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    return (
        <button
            type="button"
            className="sbte-export-button btn btn-secondary"
            onClick={(): void => props.handleExport(editingTrack)}
        >
            <i className="fas fa-file-export" /> Export File
        </button>
    );
};

export default ExportTrackCuesButton;
