import { ReactElement } from "react";
import { useDispatch } from "react-redux";
import { showSearchReplace } from "../cues/searchReplace/searchReplaceSlices";
import { showMerge } from "../cues/merge/mergeSlices";

const SearchReplaceButton = (): ReactElement => {
    const dispatch = useDispatch();
    return (
        <button
            type="button"
            className="sbte-search-replace-button btn btn-secondary"
            onClick={(): void => {
                dispatch(showMerge(false));
                dispatch(showSearchReplace(true));
            }}
        >
            <i className="fas fa-search-plus" /> Search/Replace
        </button>
    );
};

export default SearchReplaceButton;
