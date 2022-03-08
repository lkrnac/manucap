import { ReactElement } from "react";
import KeyboardShortcuts from "./keyboardShortcuts/KeyboardShortcuts";
import ShiftTimeButton from "./shift/ShiftTimeButton";
import SubtitleSpecificationsButton from "./subtitleSpecifications/SubtitleSpecificationsButton";
import CaptionOverlapToggle from "./CaptionOverlapToggle";
import ExportTrackCuesButton from "./export/ExportTrackCuesButton";
import ImportTrackCuesButton from "./ImportTrackCuesButton";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import SearchReplaceButton from "./SearchReplaceButton";
import MergeCuesButton from "./MergeCuesButton";
import ExportSourceTrackCuesButton from "./export/ExportSourceTrackCuesButton";
import CueCommentsToggle from "./CueCommentsToggle";
import WaveformToggle from "./WaveformToggle";
import { Menu, Transition } from "@headlessui/react";
import TimecodesLockToggle from "./TimecodesLockToggle";
import SyncCuesButton from "./SyncCuesButton";

interface Props {
    handleExportFile: () => void;
    handleExportSourceFile: () => void;
    handleImportFile: () => void;
}

const Toolbox = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const editingTask = useSelector((state: SubtitleEditState) => state.cuesTask);
    const isTranslation = editingTrack?.type === "TRANSLATION";
    return (
        <div className="tw-mt-6 tw-flex tw-items-center tw-justify-center sbte-button-toolbar">
            <SubtitleSpecificationsButton />
            <SearchReplaceButton />
            <ImportTrackCuesButton
                handleImport={props.handleImportFile}
                disabled={editingTask?.editDisabled}
            />
            { isTranslation ?
                <ExportSourceTrackCuesButton handleExport={props.handleExportSourceFile} /> : null }
            <ExportTrackCuesButton
                handleExport={props.handleExportFile}
            />
            <Menu as="div" className="md:tw-relative tw-dropdown-wrapper">
                {({ open }): ReactElement => (
                    <>
                        <Menu.Button id="cue-line-category" as="div" className="tw-cursor-pointer">
                            <button
                                className={`tw-select-none ${open ? "tw-open-true focus active" : "tw-open-false"}` +
                                    " dropdown-toggle btn btn-secondary"}
                            >
                                <i className="fas fa-ellipsis-h" />
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
                            <div className={`tw-absolute tw-left-0 tw-open-${open} tw-min-w-[220px] tw-w-[220px]`}>
                                <Menu.Items
                                    as="ul"
                                    static
                                    className="tw-dropdown-menu tw-flex tw-flex-row tw-flex-wrap"
                                >
                                    <Menu.Item as="li">
                                        <div className="tw-dropdown-item">
                                            <KeyboardShortcuts />
                                        </div>
                                    </Menu.Item>
                                    <Menu.Item as="li">
                                        <div className="tw-dropdown-item">
                                            <ShiftTimeButton />
                                        </div>
                                    </Menu.Item>
                                    <Menu.Item as="li">
                                        <div className="tw-dropdown-item">
                                            <CaptionOverlapToggle />
                                        </div>
                                    </Menu.Item>
                                    {isTranslation ? (
                                        <Menu.Item as="li" className="sbte-dropdown-item">
                                            <div className="tw-dropdown-item">
                                                <SyncCuesButton />
                                            </div>
                                        </Menu.Item>
                                    ) : null}
                                    <Menu.Item as="li">
                                        <div className="tw-dropdown-item">
                                            <MergeCuesButton />
                                        </div>
                                    </Menu.Item>
                                    <Menu.Item as="li" className="sbte-dropdown-item">
                                        <div className="tw-dropdown-item">
                                            <CueCommentsToggle />
                                        </div>
                                    </Menu.Item>
                                    {isTranslation ? (
                                        <Menu.Item as="li" className="sbte-dropdown-item">
                                            <div className="tw-dropdown-item">
                                                <TimecodesLockToggle />
                                            </div>
                                        </Menu.Item>
                                    ) : null}
                                    <Menu.Item as="li" className="sbte-dropdown-item">
                                        <div className="tw-dropdown-item">
                                            <WaveformToggle />
                                        </div>
                                    </Menu.Item>
                                </Menu.Items>
                            </div>
                        </Transition>
                    </>
                )}
            </Menu>
        </div>
    );
};

export default Toolbox;
