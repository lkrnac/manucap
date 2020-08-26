import React, { ReactElement } from "react";

interface Props {
    children: ReactElement;
}

export const SearchReplaceMatch = (props: Props): ReactElement | null => {
    return (
        <span style={{border: "solid 1px rgb(75,0,130)", backgroundColor: "rgb(230,230,250)"}}>
            {props.children}
        </span>
    );
};
