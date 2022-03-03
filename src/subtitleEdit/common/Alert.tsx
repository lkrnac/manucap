import { CSSProperties, Fragment, ReactElement, ReactNode, useEffect } from "react";
import { Transition } from "@headlessui/react";

const AUTO_CLOSE_DELAY = 150000000;

interface Props {
    show?: boolean,
    autoClose?: boolean,
    autoCloseDelay?: number,
    alertClass?: string,
    onClose?: () => void,
    style?: CSSProperties,
    dismissible?: boolean,
    children: ReactNode
}

const Alert = (props: Props): ReactElement => {

    useEffect(() => {
        let timeout: NodeJS.Timeout | undefined;

        if (props.show) {
            if (props.autoClose && props.onClose) {
                timeout = setTimeout(props.onClose, props.autoCloseDelay || AUTO_CLOSE_DELAY);
            }
        }

        return (): void => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [props.show, props.autoClose, props.onClose, props.autoCloseDelay]);

    const propClassName = `${props.alertClass ? ` ${props.alertClass}` : ""}`;

    return (
        <Transition
            show={props.show || false}
            as={Fragment}
            enter="tw-ease-out tw-duration-300"
            enterFrom="tw-opacity-0"
            enterTo="tw-opacity-100"
            leave="tw-ease-in tw-duration-300"
            leaveFrom="tw-opacity-100"
            leaveTo="tw-opacity-0"
        >
            <div
                className={`tw-alert tw-alert-component${propClassName}`}
                style={props.style}
            >
                {props.dismissible ? (
                    <button
                        className="tw-absolute tw-right-7 tw-top-3 tw-font-bold
                            tw-text-red-900 tw-text-opacity-60 tw-text-sm tw-alert-close"
                        onClick={props.onClose}
                    >
                        <span aria-hidden>x</span>
                    </button>
                ): null}
                {props.children}
            </div>
        </Transition>
    );
};

export default Alert;
