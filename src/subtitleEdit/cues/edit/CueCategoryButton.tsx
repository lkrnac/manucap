import { ReactElement } from "react";
import { CueCategory } from "../../model";
import { cueCategoryToPrettyName } from "../cueUtils";
import { Menu } from "@headlessui/react";

interface Props {
    category?: CueCategory;
    onChange: (value: CueCategory) => void;
}

const CueCategoryButton = (props: Props): ReactElement => (
    <Menu as="div" className="md:tw-relative tw-dropdown-wrapper">
        {({ open }): ReactElement => (
            <>
                <Menu.Button as="div" className="tw-cursor-pointer">
                    <button
                        className={`tw-select-none ${open ? "tw-open-true focus active" : "tw-open-false"}` +
                            " dropdown-toggle btn btn-outline-secondary"}
                    >
                        {cueCategoryToPrettyName[props.category || "DIALOGUE"]}
                        <span className="caret" />
                    </button>
                </Menu.Button>
                <div className={`tw-absolute tw-left-0 tw-open-${open} tw-min-w-[210px] tw-w-[210px]`}>
                    <Menu.Items
                        as="ul"
                        static
                        className="tw-dropdown-menu tw-transition-all tw-origin-top-left
                            tw-duration-300 tw-flex tw-flex-row tw-flex-wrap"
                    >
                        <Menu.Item onClick={(): void => props.onChange("DIALOGUE")}>
                            <div className="tw-dropdown-item">
                                {cueCategoryToPrettyName.DIALOGUE}
                            </div>
                        </Menu.Item>
                        <hr />
                        <Menu.Item onClick={(): void => props.onChange("ONSCREEN_TEXT")}>
                            <div className="tw-dropdown-item">
                                {cueCategoryToPrettyName.ONSCREEN_TEXT}
                            </div>
                        </Menu.Item>
                        <Menu.Item onClick={(): void => props.onChange("AUDIO_DESCRIPTION")}>
                            <div className="tw-dropdown-item">
                                {cueCategoryToPrettyName.AUDIO_DESCRIPTION}
                            </div>
                        </Menu.Item>
                        <Menu.Item onClick={(): void => props.onChange("LYRICS")}>
                            <div className="tw-dropdown-item">
                                {cueCategoryToPrettyName.LYRICS}
                            </div>
                        </Menu.Item>
                    </Menu.Items>
                </div>
            </>
        )}
    </Menu>
);

export default CueCategoryButton;
