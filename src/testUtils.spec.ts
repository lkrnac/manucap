export const removeVideoPlayerDynamicValue =
    (htmlString: string) => htmlString.replace(/testvpid_component_[0-9]+/g, "");