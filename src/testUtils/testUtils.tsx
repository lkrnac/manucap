import { ReactWrapper } from "enzyme";

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
