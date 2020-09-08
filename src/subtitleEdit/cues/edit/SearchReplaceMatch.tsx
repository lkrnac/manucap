import React, { ReactElement, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";

interface Props {
    children: ReactElement;
    start: number;
    end: number;
    replaceMatch: (replacement: string | undefined, start: number, end: number) => void;
}

export const SearchReplaceMatch = (props: Props): ReactElement => {
    const replacement = useSelector((state: SubtitleEditState) => state.searchReplace.replacement);
    const replaceMatchCounter = useSelector((state: SubtitleEditState) => state.searchReplace.replaceMatchCounter);
    const previousReplaceMatchCounter = useRef(replaceMatchCounter);

    useEffect(
        () => {
            if (previousReplaceMatchCounter.current !== replaceMatchCounter) {
                props.replaceMatch(replacement, props.start, props.end);
                previousReplaceMatchCounter.current = replaceMatchCounter;
            }
         },
        [ props, replacement, replaceMatchCounter ]
    );

    return (
        <span style={{ border: "solid 1px rgb(75,0,130)", backgroundColor: "rgb(230,230,250)" }}>
            {props.children}
        </span>
    );
};
