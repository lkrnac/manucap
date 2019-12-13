import {ReactWrapper} from "enzyme";

export const removeVideoPlayerDynamicValue =
    (htmlString: string): string => htmlString.replace(/video-player_component_[0-9]+/g, "");

export const simulateComponentDidUpdate = (node: ReactWrapper, propsUpdate: object): void => {
    const oldProps = node.props();
    node.setProps({ ...node.props(), ...propsUpdate });
    // @ts-ignore - Test should fail if instance is not defined
    node.instance().componentDidUpdate(oldProps, undefined, undefined);
};
