import React, { createRef, ReactElement, RefObject, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { isDirectTranslationTrack } from "../../utils/subtitleEditUtils";
import AddCueLineButton from "../edit/AddCueLineButton";
import { CueLineDto, ScrollPosition, Track } from "../../model";
import CueLine from "../cueLine/CueLine";
import { addCue } from "./cuesListActions";
import { SubtitleEditState } from "../../subtitleEditReducers";
import Mousetrap from "mousetrap";
import { KeyCombination } from "../../utils/shortcutConstants";
import { changeScrollPosition } from "./cuesListScrollSlice";

const DEFAULT_PAGE_SIZE = 50;

interface Props {
    editingTrack: Track | null;
    currentPlayerTime: number;
}

const CuesList = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const targetCuesArray = useSelector((state: SubtitleEditState) => state.cues);
    const matchedCues = useSelector((state: SubtitleEditState) => state.matchedCues);
    const startAt = useSelector((state: SubtitleEditState) => state.focusedCueIndex);

    const withoutSourceCues = props.editingTrack?.type === "CAPTION" || isDirectTranslationTrack(props.editingTrack);
    const showStartCaptioning = matchedCues.matchedCues.length === 0;
    const pageIndex = startAt ? Math.floor(startAt / DEFAULT_PAGE_SIZE) : 0;
    const startIndex = pageIndex * DEFAULT_PAGE_SIZE;
    const endIndex = (pageIndex + 1) * DEFAULT_PAGE_SIZE;
    const [refs, setRefs] = useState([] as RefObject<HTMLDivElement>[]);

    useEffect(
        () => {
            setRefs(
                Array(matchedCues.matchedCues.length)
                    .fill(undefined)
                    .map(() => createRef())
            );
            Mousetrap.bind([KeyCombination.ENTER], () => {
                if (showStartCaptioning) {
                    dispatch(addCue(0, []));
                }
                return false;
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once -> mount
    );

    useEffect(
        () => {
            const ref = refs[startAt];
            if (ref !== undefined && ref.current !== null) {
                dispatch(changeScrollPosition(ScrollPosition.NONE));
                ref.current.scrollIntoView({ block: "nearest", inline: "nearest" });
            }
        }
    );
    return (
        <>
            {
                showStartCaptioning
                    ? <AddCueLineButton text="Start Captioning" cueIndex={-1} sourceCueIndexes={[]} />
                    : null
            }
            <div style={{ overflow: "auto" }}>
                {
                    startIndex > 0
                        ? (
                            <button
                                style={{ maxHeight: "38px", width: "100%" }}
                                className="btn btn-outline-secondary sbte-add-cue-button"
                                onClick={(): void => {
                                    dispatch(changeScrollPosition(ScrollPosition.PREVIOUS_PAGE));
                                }}
                            >
                                Load Previous Cues
                            </button>
                        )
                        : null
                }
                {
                    matchedCues.matchedCues.slice(startIndex, endIndex)
                        .map((item: CueLineDto, i) => {
                            return (
                                <CueLine
                                    key={startIndex + i}
                                    data={item}
                                    rowIndex={startIndex + i}
                                    rowProps={{
                                        playerTime: props.currentPlayerTime,
                                        targetCuesLength: targetCuesArray.length,
                                        withoutSourceCues,
                                        matchedCues: matchedCues.matchedCues
                                    }}
                                    rowRef={refs[startIndex + i]}
                                />
                            );
                        })
                }
                {
                    endIndex < matchedCues.matchedCues.length
                        ? (
                            <button
                                style={{ width: "100%", paddingTop: "5px" }}
                                className="btn btn-outline-secondary"
                                onClick={(): void => {
                                    dispatch(changeScrollPosition(ScrollPosition.NEXT_PAGE));
                                }}
                            >
                                Load Next Cues
                            </button>
                        )
                        : null
                }
            </div>
        </>
    );
};

export default CuesList;
