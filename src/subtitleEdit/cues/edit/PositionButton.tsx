import { findPositionIcon, Position, PositionIcon, positionIcons } from "../cueUtils";
import { ReactElement } from "react";
import { Menu } from "@headlessui/react";
import Tooltip from "../../common/Tooltip";

interface Props {
    vttCue: VTTCue;
    changePosition: (position: Position) => void;
}

const PositionButton = (props: Props): ReactElement => (
    <Menu
        as="div"
        className="md:tw-relative tw-dropdown-wrapper"
        style={{ marginBottom: "5px", marginRight: "10px" }}
    >
        {({ open }): ReactElement => (
            <>
                <Tooltip
                    message="Set the position of this subtitle"
                    placement="top"
                >
                    <Menu.Button as="div" className="tw-cursor-pointer">
                        <button
                            className={"tw-select-none dropdown-toggle btn btn-outline-secondary " +
                                `${open ? "tw-open-true focus active" : "tw-open-false"}`}
                        >
                            {findPositionIcon(props.vttCue).iconText}
                            <span className="caret" />
                        </button>
                    </Menu.Button>
                </Tooltip>
                <div className={`tw-absolute tw-left-0 tw-open-${open} tw-min-w-[210px] tw-w-[210px]`}>
                    <Menu.Items
                        as="ul"
                        static
                        className="tw-dropdown-menu tw-transition-all tw-origin-top-left
                            tw-duration-300 tw-flex tw-flex-row tw-flex-wrap"
                    >
                        {
                            positionIcons.map((positionIcon: PositionIcon, index: number): ReactElement =>
                                (
                                    <Menu.Item
                                        key={index}
                                        onClick={(): void => props.changePosition(positionIcon.position)}
                                    >
                                        <div
                                            className="sbte-dropdown-item dropdown-item tw-cursor-pointer"
                                            style={{
                                                lineHeight: "38px",
                                                width: "38px",
                                                margin: "auto",
                                                padding: "0px",
                                                borderRadius: "3px",
                                                paddingLeft: positionIcon.leftPadding
                                            }}
                                        >
                                            {positionIcon.iconText}
                                        </div>
                                    </Menu.Item>
                                )
                            )
                        }
                    </Menu.Items>
                </div>
            </>
        )}
    </Menu>
);

export default PositionButton;
