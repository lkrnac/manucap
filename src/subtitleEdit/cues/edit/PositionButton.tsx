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
                className="w-[38px] inline-flex items-center justify-center p-2
                    text-gray-700 rounded cursor-pointer hover:bg-blue-light/10 hover:text-blue-light"
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
                className="select-none flex items-center justify-center
                    sbte-dropdown-toggle sbte-btn sbte-btn-light w-[68px]"
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
                className="position-button-list w-[210px] min-w-[210px]"
                ref={menu}
                popup
                model={menuModel}
            />
        </>
    );
};

export default PositionButton;
