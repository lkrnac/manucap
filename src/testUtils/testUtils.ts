import { Dispatch } from "redux";
import { ReactWrapper } from "enzyme";

export const removeVideoPlayerDynamicValue =
    (htmlString: string): string => htmlString.replace(/video-player_component_[0-9]+/g, "");

export const removeDraftJsDynamicValues = (htmlString: string): string => {
    return htmlString.replace(/("placeholder-[\S]*")/g, "\"\"")
        .replace(/(data-editor="[\S]*")/g, "data-editor=\"\"")
        .replace(/(data-offset-key="[\S]*")/g, "data-offset-key=\"\"");
};

export const simulateComponentDidUpdate = (node: ReactWrapper, propsUpdate: object): void => {
    const oldProps = node.props();
    node.setProps({ ...node.props(), ...propsUpdate });
    // @ts-ignore - Test should fail if instance is not defined
    node.instance().componentDidUpdate(oldProps, undefined, undefined);
};

export const dispatchFunctionTest = (): Promise<void> =>
    async (dispatch: Dispatch): Promise<void> => {
    dispatch(exports.functionToMock());
};
