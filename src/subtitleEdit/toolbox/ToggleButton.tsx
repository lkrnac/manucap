import { FunctionComponent, PropsWithChildren, ReactElement, useEffect, useState } from "react";

interface Props {
    className?: string;
    onClick?: () => void;
    toggled?: boolean;
    disabled?: boolean;
    title?: string;
    render: (toggle: boolean) => ReactElement;
}

const ToggleButton: FunctionComponent<Props> = (props: PropsWithChildren<Props>) => {
    const [toggle, setToggle] = useState(false);
    useEffect(() => {
        setToggle(props.toggled || false);
    }, [props.toggled]);
    return (
        <button
            type="button"
            className={(props.className ? props.className : "") + (toggle ? " sbte-toggled-btn" : "")}
            onClick={(): void => {
                setToggle(!toggle);
                props.onClick && props.onClick();
            }}
            disabled={props.disabled}
            title={props.title}
            style={{ padding: "5px 10px", width: "100%" }}
        >
            { props.render(toggle) }
        </button>
    );
};

export default  ToggleButton;
