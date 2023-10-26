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

    const menuModel = positionIcons.map(icon => ({
        template: () => (
            <span
                className="mc-position-button-option"
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
            <button
                className="mc-position-toggle-button mc-dropdown-toggle mc-btn mc-btn-light"
                aria-controls="positionButtonMenu"
                aria-haspopup
                onClick={toggleMenu}
            >
                <span>{findPositionIcon(props.vttCue).iconText}</span>
                <span className="caret" />
            </button>
            <Menu
                id="positionButtonMenu"
                className="mc-position-button-list"
                ref={menu}
                popup
                model={menuModel}
            />
        </>
    );
};

export default PositionButton;
