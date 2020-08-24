import React, { ReactElement, useRef } from "react";

interface Props {
    children: ReactElement;
    offsetKey?: number;
}

export const CueExtraCharacters = (props: Props): ReactElement | null => {
    const target = useRef(null);
    return (
        <span
            ref={target}
            className="sbte-extra-text"
            data-offset-key={props.offsetKey}
        >
            {props.children}
        </span>
    );
};
