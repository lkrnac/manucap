import { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { showMerge } from "./mergeSlices";
import { mergeCues } from "../cuesList/cuesListActions";

const MergeEditor = (): ReactElement | null => {
    const dispatch = useDispatch();
    const mergeVisible = useSelector((state: SubtitleEditState) => state.mergeVisible);

    return mergeVisible ? (
        <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
            <label style={{ marginTop: "10px" }}>
                Select the lines to be merged then click Merge
            </label>
            <button
                className="sbte-btn sbte-btn-light sbte-btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="sbte-search-prev"
                onClick={(): void => {
                    dispatch(mergeCues());
                }}
            >
                Merge
            </button>
            <span style={{ flex: 1 }} />
            <button
                className="sbte-btn sbte-btn-danger sbte-btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="sbte-close-merge-sbte-btn"
                onClick={(): void => {
                    dispatch(showMerge(false));
                }}
            >
                <i className="far fa-times-circle" />
            </button>
        </div>
    ) : null;
};

export default MergeEditor;
