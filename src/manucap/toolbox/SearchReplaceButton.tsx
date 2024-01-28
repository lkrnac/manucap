import { ReactElement } from "react";
import { useDispatch } from "react-redux";
import { showSearchReplace } from "../cues/searchReplace/searchReplaceSlices";
import { showMerge } from "../cues/merge/mergeSlices";
import { Tooltip } from "primereact/tooltip";
import Icon from "@mdi/react";
import { mdiFindReplace } from "@mdi/js";

const SearchReplaceButton = (): ReactElement => {
    const dispatch = useDispatch();
    return (
        <>
            <button
                id="searchReplaceBtn"
                className="mc-search-replace-button mc-btn mc-btn-light"
                onClick={(): void => {
                    dispatch(showMerge(false));
                    dispatch(showSearchReplace(true));
                }}
                data-pr-tooltip="Search / Replace"
                data-pr-position="top"
                data-pr-at="center+2 top-2"
            >
                <Icon path={mdiFindReplace} size={1.25} />
            </button>
            <Tooltip
                id="searchReplaceBtnTooltip"
                target="#searchReplaceBtn"
            />
        </>
    );
};

export default SearchReplaceButton;
