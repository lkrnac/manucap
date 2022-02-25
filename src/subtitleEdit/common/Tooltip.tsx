import { Fragment, ReactElement, ReactNode, useState, cloneElement, Children } from "react";
import { Popover, Transition } from "@headlessui/react";
import { usePopper } from "react-popper";

interface Props {
    message: string
    offset?: [number, number]
    disabled?: boolean
    placement?: "top-start" | "top-end" | "bottom-start" | "bottom-end" |
        "right-start" | "right-end" | "left-start" | "left-end" | "bottom" | "right" | "left" | "top"
    children: ReactNode
    toggleClassName?: string
    tooltipId?: string
}

const Tooltip = (props: Props): ReactElement => {
    const placement = props.placement || "bottom";
    const offset = 10;
    const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>();
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>();
    const { update, styles, attributes } = usePopper(referenceElement, popperElement, {
        placement,
        modifiers: [
            {
                name: "offset",
                options: {
                    offset: props.offset || [0, offset],
                },
            },
            {
                name: "preventOverflow",
                enabled: false
            },
            {
                name: "flip",
                enabled: false
            }
        ]
    });

    const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

    return (
        <Popover as={Fragment}>
            <Popover.Button
                as="div"
                onMouseEnter={(): void => {
                    if (!props.disabled) {
                        setTooltipOpen(true);
                    }
                }}
                onMouseLeave={(): void => setTooltipOpen(false)}
                className={props.toggleClassName}
            >
                {Children.map(props.children, (child) => {
                    return cloneElement(child as ReactElement, { ref: setReferenceElement });
                })}
            </Popover.Button>
            {tooltipOpen && (
                <Popover.Panel
                    static
                    ref={setPopperElement}
                    style={styles.popper}
                    {...attributes.popper}
                    className="tw-z-40 tw-popper-wrapper"
                >
                    <Transition
                        show={tooltipOpen}
                        appear={false}
                        className="tw-transition-opacity tw-duration-300 tw-pointer-events-none tw-ease-in-out"
                        enterFrom="tw-opacity-0"
                        enterTo="tw-opacity-100"
                        leaveFrom="tw-opacity-100"
                        leaveTo="tw-opacity-0"
                        beforeEnter={async (): Promise<void> => {
                            if (update) await update();
                        }}
                    >
                        <div className="tw-tooltip tw-arrow before:tw-border-b-blue-grey-700">
                            {props.message}
                        </div>
                    </Transition>
                </Popover.Panel>
            )}
        </Popover>
    );
};

export default Tooltip;
