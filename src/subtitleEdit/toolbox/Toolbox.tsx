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
        <div className="tw-mt-6 tw-space-x-2 tw-flex tw-items-center tw-z-10 tw-justify-center sbte-button-toolbar">
            <div>
                <SubtitleSpecificationsButton />
            </div>
            <div>
                <SearchReplaceButton />
            </div>
            <div>
                <ImportTrackCuesButton
                    handleImport={props.handleImportFile}
                    disabled={editingTask?.editDisabled}
                />
            </div>
            { isTranslation ? (
                <div>
                    <ExportSourceTrackCuesButton handleExport={props.handleExportSourceFile} />
                </div>
            ) : null }
            <div>
                <ExportTrackCuesButton
                    handleExport={props.handleExportFile}
                />
            </div>
            <Menu as="div" className="md:tw-relative tw-dropdown-wrapper">
                {({ open }): ReactElement => (
                    <>
                        <Menu.Button id="cue-line-category" as="div" className="tw-cursor-pointer">
                            <button
                                className={`tw-select-none${open ? " focus active" : ""}` +
                                    " dropdown-toggle btn btn-secondary"}
                            >
                                <i className="fas fa-ellipsis-h" />
                            </button>
                        </Menu.Button>
                        <div className="tw-absolute tw-bottom-full tw-left-0 tw-min-w-[240px] tw-w-[240px]">
                            <Transition
                                unmount={false}
                                show={open}
                                className="tw-transition-all tw-duration-300 tw-ease-in-out tw-origin-bottom-left"
                                enterFrom="tw-opacity-0 tw-scale-75"
                                enterTo="tw-opacity-100 tw-scale-100"
                                leaveFrom="tw-opacity-100 tw-scale-100"
                                leaveTo="tw-opacity-0 tw-scale-75"
                            >
                                <Menu.Items
                                    as="ul"
                                    static
                                    className="tw-dropdown-menu"
                                >
                                    <Menu.Item as="li">
                                        <KeyboardShortcuts />
                                    </Menu.Item>
                                    <div className="tw-dropdown-separator" />
                                    <Menu.Item as="li">
                                        <ShiftTimeButton />
                                    </Menu.Item>
                                    {isTranslation ? (
                                        <Menu.Item as="li">
                                            <SyncCuesButton />
                                        </Menu.Item>
                                    ) : null}
                                    <Menu.Item as="li">
                                        <MergeCuesButton />
                                    </Menu.Item>
                                    <div className="tw-dropdown-separator" />
                                    {isTranslation ? (
                                        <Menu.Item as="li">
                                            <TimecodesLockToggle />
                                        </Menu.Item>
                                    ) : null}
                                    <Menu.Item as="li">
                                        <CaptionOverlapToggle />
                                    </Menu.Item>
                                    <div className="tw-dropdown-separator" />
                                    <Menu.Item as="li" className="sbte-dropdown-item">
                                        <CueCommentsToggle />
                                    </Menu.Item>
                                    <Menu.Item as="li">
                                        <WaveformToggle />
                                    </Menu.Item>
                                </Menu.Items>
                            </Transition>
                        </div>
                    </>
                )}
            </Menu>
        </div>
    );
};

export default Toolbox;
