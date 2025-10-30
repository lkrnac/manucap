import { render, RenderResult } from "@testing-library/react";
import { ReactElement } from "react";

export const removeVideoPlayerDynamicValue =
    (htmlString: string): string => htmlString.replace(/video-player_component_[0-9]+/g, "");

export const removeDraftJsDynamicValues = (htmlString: string): string => {
    return htmlString.replace(/("placeholder-[\S]*")/g, "\"\"")
        .replace(/(data-editor="[\S]*")/g, "data-editor=\"\"")
        .replace(/(data-offset-key="[\S]*")/g, "data-offset-key=\"\"");
};

export const fixVideoPlayerInvalidTime =
    (htmlString: string): string => htmlString.replace(/(>0:00<)/g, ">00:00.000<");

export const removeBackgroundColorStyle =
    (htmlString: string): string => htmlString.replace(/(background-color: rgba\(.*\));/g, "");

export const removeIds = (html: string): string => {
    return html.replace(/id="\w+" /g, "")
        .replace(/pr_id_\d(_\w*)/g, "")
        .replace(/ pr_id_\d=""/g, "")
        .replace(/z-index: ?\d*; ?/g, "")
        .replace(/ ?style=""/g, "");
};

export const removeNewlines = (html: string): string => (html.replace(/\s+/g, ' '));

export const renderWithPortal = (element: ReactElement): RenderResult => {
    const holder = document.createElement("div");
    holder.setAttribute("id", "prime-react-dialogs");
    document.body.appendChild(holder);
    return render(<div>{element}</div>, { container: holder });
};

export interface MockedDebouncedFunction extends Function {
    cancel: Function;
}
