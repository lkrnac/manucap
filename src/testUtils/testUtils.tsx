import { ReactWrapper } from "enzyme";
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

export const spellCheckOptionPredicate = (optionIndex: number) => (wrapper: ReactWrapper): boolean =>
    wrapper.hasClass(/css-[\s\S]*?-option/)
    // @ts-ignore Couldn't figure this out, there would need to be a lot of additional null checks
    && wrapper.getDOMNode().getAttribute("id").endsWith("-option-" + optionIndex);

export interface MockedDebouncedFunction extends Function {
    cancel: Function;
}

export const findByTextIgnoreTags = (text: string, node: Element): boolean => {
    const hasText = (node: Element): boolean => node.textContent === text;
    const nodeHasText = hasText(node);
    const childrenDontHaveText = Array.from(node.children).every(
        (child) => !hasText(child)
    );
    return nodeHasText && childrenDontHaveText;
};

export const renderWithHeadlessPortal = (element: ReactElement): RenderResult => {
    const holder = document.createElement("div");
    holder.setAttribute("id", "headlessui-portal-root");
    document.body.appendChild(holder);
    return render(<div>{element}</div>, { container: holder });
};

export const getHeadlessDialog = (element: RenderResult): Element => {
    return element.container.querySelector(".tw-modal") as Element;
};

export const removeHeadlessAttributes = (html: string): string => {
    return html
        .replace(/headlessui-[a-z-]+\d+/g, "")
        .replace(/ ?tabindex="-?\d+"+/g, "")
        .replace(/ ?style=""/g, "");
};
