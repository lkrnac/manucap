import { ReactElement } from "react";
import { useDispatch } from "react-redux";
import { showSearchReplace } from "../cues/searchReplace/searchReplaceSlices";
import { showMerge } from "../cues/merge/mergeSlices";
import Tooltip from "../common/Tooltip";

const SearchReplaceButton = (): ReactElement => {
    const dispatch = useDispatch();
    return (
        <Tooltip
            tooltipId="searchReplaceBtnTooltip"
            message="Search/Replace"
            offset={[-7, 10]}
        >
            <button
                type="button"
                className="sbte-search-replace-button btn btn-secondary"
                onClick={(): void => {
                    dispatch(showMerge(false));
                    dispatch(showSearchReplace(true));
                }}
            >
                <i className="fas fa-search-plus fa-lg" />
            </button>
        </Tooltip>
    );
};

export default SearchReplaceButton;
