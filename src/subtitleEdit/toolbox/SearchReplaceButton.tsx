import { ReactElement } from "react";
import { useDispatch } from "react-redux";
import { showSearchReplace } from "../cues/searchReplace/searchReplaceSlices";
import { showMerge } from "../cues/merge/mergeSlices";
import { TooltipWrapper } from "../TooltipWrapper";

const SearchReplaceButton = (): ReactElement => {
    const dispatch = useDispatch();
    return (
        <TooltipWrapper
            tooltipId="searchReplaceBtnTooltip"
            text="Search/Replace"
            placement="bottom"
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
        </TooltipWrapper>
    );
};

export default SearchReplaceButton;
