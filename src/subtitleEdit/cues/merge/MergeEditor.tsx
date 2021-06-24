import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { showMerge } from "./mergeSlices";
import { mergeCues } from "../cuesListActions";

const MergeEditor = (): ReactElement | null => {
    const dispatch = useDispatch();
    const mergeVisible = useSelector((state: SubtitleEditState) => state.mergeVisible);

    return mergeVisible ? (
        <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
            <label style={{ marginTop: "10px" }}>
                Select the lines to be merged then click Merge
            </label>
            <button
                className="btn btn-secondary btn-sm"
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
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="sbte-close-merge-btn"
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