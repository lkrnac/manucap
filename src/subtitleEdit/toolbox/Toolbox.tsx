import { ReactElement } from "react";
import KeyboardShortcuts from "./keyboardShortcuts/KeyboardShortcuts";
import ShiftTimeButton from "./shift/ShiftTimeButton";
import SubtitleSpecificationsButton from "./subtitleSpecifications/SubtitleSpecificationsButton";
import CaptionOverlapToggle from "./CaptionOverlapToggle";
import ExportTrackCuesButton from "./export/ExportTrackCuesButton";
import ImportTrackCuesButton from "./ImportTrackCuesButton";
import SyncCuesButton from "./SyncCuesButton";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import SearchReplaceButton from "./SearchReplaceButton";
import MergeCuesButton from "./MergeCuesButton";
import ExportSourceTrackCuesButton from "./export/ExportSourceTrackCuesButton";
import CueCommentsToggle from "./CueCommentsToggle";
import TimecodesLockToggle from "./TimecodesLockToggle";
import WaveformToggle from "./WaveformToggle";
import { Disclosure, Transition } from "@headlessui/react";

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
        <Disclosure defaultOpen>
            <div
                style={{ marginTop: "10px" }}
                className="sbte-toolbox"
            >
                <div className="card">
                    <Disclosure.Button className="card-header" as="div">Toolbox</Disclosure.Button>
                    <Transition
                        className="tw-overflow-hidden tw-h-full tw-transition-all"
                        enter="tw-duration-500 tw-ease-out"
                        enterFrom="tw-max-h-0"
                        enterTo="tw-max-h-[1000px]"
                        leave="tw-duration-500 tw-ease-out"
                        leaveFrom="tw-max-h-[1000px]"
                        leaveTo="tw-max-h-0"
                        unmount={false}
                        appear={false}
                    >
                        <Disclosure.Panel static>
                            <div className="card-body">
                                <div role="toolbar" className="sbte-button-toolbar btn-toolbar">
                                    <KeyboardShortcuts />
                                    <SubtitleSpecificationsButton />
                                    <ShiftTimeButton />
                                    <CaptionOverlapToggle />
                                    { isTranslation ?
                                        <ExportSourceTrackCuesButton
                                            handleExport={props.handleExportSourceFile}
                                        /> : null }
                                    <ExportTrackCuesButton
                                        handleExport={props.handleExportFile}
                                    />
                                    <ImportTrackCuesButton
                                        handleImport={props.handleImportFile}
                                        disabled={editingTask?.editDisabled}
                                    />
                                    <SearchReplaceButton />
                                    { isTranslation ? <SyncCuesButton /> : null }
                                    <MergeCuesButton />
                                    <CueCommentsToggle />
                                    { isTranslation ? <TimecodesLockToggle /> : null }
                                    <WaveformToggle />
                                </div>
                            </div>
                        </Disclosure.Panel>
                    </Transition>
                </div>
            </div>
        </Disclosure>
    );
};

export default Toolbox;
