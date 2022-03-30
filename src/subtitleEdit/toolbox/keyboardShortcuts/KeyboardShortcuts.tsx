import { ReactElement, useEffect, Dispatch, SetStateAction } from "react";
import { KeyCombination } from "../../utils/shortcutConstants";
import Mousetrap from "mousetrap";

interface Props {
    setShow: Dispatch<SetStateAction<boolean>>,
    show: boolean
}

const KeyboardShortcuts = ({ setShow, show }: Props): ReactElement => {
    useEffect(() => {
        const registerShortcuts = (): void => {
            Mousetrap.bind([KeyCombination.MOD_SHIFT_SLASH, KeyCombination.ALT_SHIFT_SLASH], () => {
                setShow(!show);
            });
        };
        registerShortcuts();
    }, [show]);

    return (
        <button
            onClick={() => setShow(true)}
            className="dotsub-keyboard-shortcuts-button"
        >
            Keyboard Shortcuts
        </button>
    );
};

export default KeyboardShortcuts;
