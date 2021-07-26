import React, { createRef, ReactElement, RefObject, useEffect, useRef, useState } from "react";
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
}

const CuesList = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const targetCuesArray = useSelector((state: SubtitleEditState) => state.cues);
    const matchedCues = useSelector((state: SubtitleEditState) => state.matchedCues);
    const previousNonNullFocusedCueIndex = useRef(-1);
    const startAt = useSelector((state: SubtitleEditState) => state.focusedCueIndex);
    if (startAt !== null) {
        previousNonNullFocusedCueIndex.current = startAt;
    }
    const scrollRef = useRef(null as HTMLDivElement | null);
    const preventScroll = useRef(false);

    const withoutSourceCues = props.editingTrack?.type === "CAPTION" || isDirectTranslationTrack(props.editingTrack);
    const showStartCaptioning = matchedCues.matchedCues.length === 0;
    const pageIndex = previousNonNullFocusedCueIndex.current > 0
        ? Math.floor(previousNonNullFocusedCueIndex.current / DEFAULT_PAGE_SIZE)
        : 0;
    const startIndex = pageIndex === 0
        ? 0
        : pageIndex * DEFAULT_PAGE_SIZE - 5;
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
            if (startAt !== null
                && refs[startAt] !== undefined
                && refs[startAt].current !== null
            ) {
                const ref = refs[startAt];
                preventScroll.current = true;
                ref?.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
            }
        }
    );

    useEffect(
        () => {
            if (scrollRef.current) {
                const onScroll = (): void => {
                    if (preventScroll.current) {
                        preventScroll.current = false;
                    } else {
                        dispatch(changeScrollPosition(ScrollPosition.NONE));
                    }
                };
                scrollRef.current.addEventListener("scroll", onScroll);
            }
        },
        [dispatch, scrollRef]
    );

    return (
        <>
            {
                showStartCaptioning
                    ? <AddCueLineButton text="Start Captioning" cueIndex={-1} sourceCueIndexes={[]} />
                    : null
            }
            <div ref={scrollRef} style={{ overflow: "auto" }}>
                {
                    startIndex > 0
                        ? (
                            <button
                                style={{ maxHeight: "38px", width: "100%" }}
                                className="btn btn-outline-secondary sbte-previous-button"
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
                                className="btn btn-outline-secondary sbte-next-button"
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
