import { ReactWrapper } from "enzyme";
import { RenderResult } from "@testing-library/react";
import { act } from "react-dom/test-utils";

export const removeVideoPlayerDynamicValue =
    (htmlString: string): string => htmlString.replace(/video-player_component_[0-9]+/g, "");

export const removeDraftJsDynamicValues = (htmlString: string): string => {
    return htmlString.replace(/("placeholder-[\S]*")/g, "\"\"")
        .replace(/(data-editor="[\S]*")/g, "data-editor=\"\"")
        .replace(/(data-offset-key="[\S]*")/g, "data-offset-key=\"\"");
};

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


export const simulateEnoughSpaceForCues = (actualNode: RenderResult, viewPortSize = 500): void => act(() => {
    const smartScrollCone = actualNode.container.querySelector(".sbte-smart-scroll") as Element;
    // @ts-ignore Mocking smart scroll calculation
    smartScrollCone.getBoundingClientRect =
        jest.fn(() => ({
            bottom: viewPortSize,
            height: viewPortSize,
            left: 0,
            right: viewPortSize,
            top: 0,
            width: viewPortSize
        }));
    window.dispatchEvent(new Event("resize")); // trigger smart scroll space re-calculation
});
