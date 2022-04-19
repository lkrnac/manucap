import { ReactElement } from "react";

interface Props {
    children: ReactElement;
    offsetKey?: number;
}

export const CueExtraCharacters = (props: Props): ReactElement | null => {
    return (
        <span
            className="tw-text-danger"
            data-offset-key={props.offsetKey}
        >
            {props.children}
        </span>
    );
};
