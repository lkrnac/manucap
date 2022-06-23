import { useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { CueDtoWithIndex, CueLineDto } from "../../model";
import { getTimeString } from "../../utils/timeUtils";

const CSV_HEADER = "Source Start,Source End,Source Text,Target Start,Target End,Target Text\r\n";

const encodeText = (value: string): string => `"${value.replace(/"/g, "\"\"")}"`;

const getCueCsvArray = (cues: Array<CueDtoWithIndex> | undefined) =>
    cues?.length ? cues.map(cueDto => [
        `${getTimeString(cueDto.cue.vttCue.startTime)}`,
        `${getTimeString(cueDto.cue.vttCue.endTime)}`,
        encodeText(cueDto.cue.vttCue.text)
    ]) : [["","",""]];

const cartesian = (sourceArray: Array<Array<string>>, targetArray: Array<Array<string>>) =>
    sourceArray.flatMap(source => targetArray.map(target => [source, target].flat()));

export const matchedCuesToCsv = (matchedCues: Array<CueLineDto>): string => {
    const result = matchedCues.map(cueLineDto => {
            const sourceArray = getCueCsvArray(cueLineDto.sourceCues);
            const targetArray = getCueCsvArray(cueLineDto.targetCues);
            const output = cartesian(sourceArray, targetArray);
            return output.map(lineArray => lineArray.join(","));
        }
    );
    return `${CSV_HEADER}${result.flat().join("\r\n")}`;
};

const useMatchedCuesAsCsv = (): Function => {
    const matchedCues = useSelector((state: SubtitleEditState) => state.matchedCues.matchedCues);
    return () => {
        return matchedCuesToCsv(matchedCues);
    };
};

export default useMatchedCuesAsCsv;
