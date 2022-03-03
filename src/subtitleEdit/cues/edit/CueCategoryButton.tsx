import { ReactElement } from "react";
import { CueCategory } from "../../model";
import { cueCategoryToPrettyName } from "../cueUtils";
import { Menu, Transition } from "@headlessui/react";

interface Props {
    category?: CueCategory;
    onChange: (value: CueCategory) => void;
}

const CueCategoryButton = (props: Props): ReactElement => (
    <Menu as="div" className="md:tw-relative tw-dropdown-wrapper">
        {({ open }): ReactElement => (
            <>
                <Menu.Button id="cue-line-category" as="div" className="tw-cursor-pointer">
                    <button
                        className={`tw-select-none ${open ? "tw-open-true focus active" : "tw-open-false"}` +
                            " dropdown-toggle btn btn-outline-secondary"}
                    >
                        {cueCategoryToPrettyName[props.category || "DIALOGUE"]}
                        <span className="caret" />
                    </button>
                </Menu.Button>
                <Transition
                    unmount
                    show={open}
                    className="tw-transition-all tw-duration-300 tw-ease-in-out tw-origin-top-left"
                    enterFrom="tw-opacity-0 tw-scale-75"
                    enterTo="tw-opacity-100 tw-scale-100"
                    leaveFrom="tw-opacity-100 tw-scale-100"
                    leaveTo="tw-opacity-0 tw-scale-75"
                >
                    <div className={`tw-absolute tw-left-0 tw-open-${open} tw-min-w-[210px] tw-w-[210px]`}>
                        <Menu.Items
                            as="ul"
                            static
                            className="tw-dropdown-menu tw-flex tw-flex-row tw-flex-wrap"
                        >
                            <Menu.Item as="li" onClick={(): void => props.onChange("DIALOGUE")}>
                                <div className="tw-dropdown-item">
                                    {cueCategoryToPrettyName.DIALOGUE}
                                </div>
                            </Menu.Item>
                            <hr />
                            <Menu.Item as="li" onClick={(): void => props.onChange("ONSCREEN_TEXT")}>
                                <div className="tw-dropdown-item">
                                    {cueCategoryToPrettyName.ONSCREEN_TEXT}
                                </div>
                            </Menu.Item>
                            <Menu.Item as="li" onClick={(): void => props.onChange("AUDIO_DESCRIPTION")}>
                                <div className="tw-dropdown-item">
                                    {cueCategoryToPrettyName.AUDIO_DESCRIPTION}
                                </div>
                            </Menu.Item>
                            <Menu.Item as="li" onClick={(): void => props.onChange("LYRICS")}>
                                <div className="tw-dropdown-item">
                                    {cueCategoryToPrettyName.LYRICS}
                                </div>
                            </Menu.Item>
                        </Menu.Items>
                    </div>
                </Transition>
            </>
        )}
    </Menu>
);

export default CueCategoryButton;
