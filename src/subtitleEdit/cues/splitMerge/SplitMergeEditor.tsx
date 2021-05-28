import React, { ReactElement } from "react";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";

const SplitMergeEditor = (): ReactElement | null => {
    const splitMergeVisible = useSelector((state: SubtitleEditState) => state.splitMergeVisible);

    return splitMergeVisible ? (
        <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="sbte-search-next"
                onClick={(): void => console.log("hi")}
            >
                <i className="fa fa-arrow-down" />
            </button>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="sbte-search-prev"
                onClick={(): void => console.log("hi")}
            >
                <i className="fa fa-arrow-up" />
            </button>
        </div>
    ) : null;
};

export default SplitMergeEditor;
