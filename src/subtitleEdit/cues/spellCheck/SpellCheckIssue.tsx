import React, { ReactElement } from "react";
import { SpellCheck } from "./model";

interface Props {
    children: ReactElement;
    spellCheck: SpellCheck;
}

export const SpellCheckIssue = (props: Props): ReactElement => {
    return <span className="sbte-text-with-error" >{props.children}</span>;
};
