import { Dialog, Transition } from "@headlessui/react";
import { ReactElement, ReactNode, Fragment } from "react";

interface Props {
    children: ReactNode,
    open?: boolean,
    onClose?: () => void,
    hideCloseButton?: boolean,
    title?: ReactNode,
    dialogClassName?: string
    contentClassname?: string
    headerClassName?: string
}

const TransitionDialog = (props: Props): ReactElement => {
    const onClose = props.onClose || ((): void => undefined);

    return (
        <Transition show={props.open || false} as={Fragment} static>
            <Dialog
                as="div"
                onClose={onClose}
                className={`tw-fixed tw-z-200 tw-inset-0 tw-overflow-y-auto tw-modal${props.dialogClassName ?
                    ` ${props.dialogClassName}` : ""}`}
            >
                <Transition.Child
                    as={Fragment}
                    enter="tw-ease-out tw-duration-300"
                    enterFrom="tw-opacity-0"
                    enterTo="tw-opacity-50"
                    entered="tw-opacity-50"
                    leave="tw-ease-out tw-duration-300"
                    leaveFrom="tw-opacity-50"
                    leaveTo="tw-opacity-0"
                >
                    <Dialog.Overlay className="tw-fixed tw-inset-0 tw-bg-black" />
                </Transition.Child>
                <div className="tw-flex tw-items-center tw-justify-center tw-p-6 tw-min-h-screen">
                    <Transition.Child
                        as={Fragment}
                        enter="tw-ease-out tw-duration-300"
                        enterFrom="tw-opacity-0 tw--translate-y-32"
                        enterTo="tw-opacity-100 tw-translate-y-0"
                        leave="tw-ease-in tw-duration-300"
                        leaveFrom="tw-opacity-100 tw-translate-y-0"
                        leaveTo="tw-opacity-0 tw--translate-y-32"
                    >
                        <div
                            className={`tw-relative tw-max-w-2xl tw-w-full tw-mx-auto tw-shadow-2xl tw-modal-content${
                                props.contentClassname ? ` ${props.contentClassname}` : ""}`}
                        >
                            {!props.hideCloseButton && (
                                <button
                                    type="button"
                                    className="tw-modal-close"
                                    onClick={onClose}
                                >
                                    <span aria-hidden="true">×</span>
                                    <span className="sr-only">Close</span>
                                </button>
                            )}
                            <div
                                className={"tw-modal-header tw-modal-header-primary" +
                                    (props.headerClassName ? ` ${props.headerClassName}` : "")}
                            >
                                <Dialog.Title as="h4">{props.title}</Dialog.Title>
                            </div>
                            <Dialog.Description as="div" className="tw-modal-description">
                                {props.children}
                            </Dialog.Description>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
};

export default TransitionDialog;
