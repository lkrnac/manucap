import React, { ReactElement } from "react";
import { Constants } from "../../constants";

interface Props {
    children: ReactElement;
}

export const SearchReplaceMatch = (props: Props): ReactElement => (
    <span style={{ backgroundColor: Constants.BLUE_BACKGROUND_COLOR }}>
        {props.children}
    </span>
);
