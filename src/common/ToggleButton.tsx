import React, {
    FunctionComponent,
    PropsWithChildren,
    ReactElement,
    useState
} from "react";

interface Props {
    className?: string;
    onClick?: () => void;
    render: (toggle: boolean) => ReactElement;
}

const ToggleButton: FunctionComponent<Props> = (props: PropsWithChildren<Props>) => {
    const [toggle, setToggle] = useState(false);
    return (
        <button
            type="button"
            className={(props.className ? props.className : "") + (toggle ? " sbte-toggled-btn" : "")}
            onClick={(): void => {
                setToggle(!toggle);
                props.onClick && props.onClick();
            }}
        >
            { props.render(toggle) }
        </button>
    );
};

export default  ToggleButton;
