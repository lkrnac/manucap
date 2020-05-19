export const removeVideoPlayerDynamicValue =
    (htmlString: string): string => htmlString.replace(/video-player_component_[0-9]+/g, "");

export const removeDraftJsDynamicValues = (htmlString: string): string => {
    return htmlString.replace(/("placeholder-[\S]*")/g, "\"\"")
        .replace(/(data-editor="[\S]*")/g, "data-editor=\"\"")
        .replace(/(data-offset-key="[\S]*")/g, "data-offset-key=\"\"");
};
