import { useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { matchedCuesToCsv } from "./cuesListTimeMatching";

const useMatchedCuesAsCsv = (): Function => {
    const matchedCues = useSelector((state: SubtitleEditState) => state.matchedCues.matchedCues);
    return () => {
        return matchedCuesToCsv(matchedCues);
    };
};

export default useMatchedCuesAsCsv;
