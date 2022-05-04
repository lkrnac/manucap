import { findPositionIcon, Position, positionIcons } from "../cueUtils";
import { ReactElement, MouseEvent, useRef } from "react";
import { Menu } from "primereact/menu";

interface Props {
    vttCue: VTTCue;
    changePosition: (position: Position) => void;
}

const PositionButton = (props: Props): ReactElement => {
    const menu = useRef<Menu>(null);
    const toggleMenu = (event: MouseEvent<HTMLElement>): void => {
        if (menu.current) {
            menu.current.toggle(event);
        }
    };

    // TODO: Get rid of Tailwind preprocessed value: [38px]

    const menuModel = positionIcons.map(icon => ({
        template: () => (
            <span
                className="tw-w-[38px] tw-inline-flex tw-items-center tw-justify-center tw-p-2
                    tw-text-gray-700 tw-rounded tw-cursor-pointer hover:tw-bg-blue-light/10 hover:tw-text-blue-light"
                onClick={(event): void => {
                    props.changePosition(icon.position);
                    toggleMenu(event);
                }}
            >
                {icon.iconText}
            </span>
        )
    }));

    return (
        <>
            {/** TODO: Get rid of Tailwind preprocessed value: [68px] **/}
            <button
                className="tw-select-none tw-flex tw-items-center tw-justify-center
                    tw-dropdown-toggle tw-btn tw-btn-light tw-w-[68px]"
                aria-controls="positionButtonMenu"
                aria-haspopup
                onClick={toggleMenu}
            >
                <span>{findPositionIcon(props.vttCue).iconText}</span>
                <span className="caret" />
            </button>
            {/** TODO: Get rid of Tailwind preprocessed value: [210px] **/}
            <Menu
                id="positionButtonMenu"
                className="position-button-list tw-w-[210px] tw-min-w-[210px]"
                ref={menu}
                popup
                model={menuModel}
            />
        </>
    );
};

export default PositionButton;
