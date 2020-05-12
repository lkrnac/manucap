import "./testUtils/initBrowserEnvironment";
import { Provider, useDispatch } from "react-redux";
import React, { ReactElement, useEffect } from "react";
import {
    updateCues,
    updateSourceCues
} from "./subtitleEdit/cues/cueSlices";
import { updateEditingTrack, updateTask } from "./subtitleEdit/trackSlices";
import { CueDto, Language } from "./subtitleEdit/model";
import ReactDOM from "react-dom";
import SubtitleEdit from "./subtitleEdit/SubtitleEdit";
import { readSubtitleSpecification } from "./subtitleEdit/toolbox/subtitleSpecificationSlice";
import testingStore from "./testUtils/testingStore";
import { setAutoSaveSuccess } from "./subtitleEdit/cues/saveSlices";
// Following CSS import has to be after SubtitleEdit import to override Bootstrap defaults
// eslint-disable-next-line sort-imports
import "./localTesting.scss";

const TestApp = (): ReactElement => {
    const dispatch = useDispatch();
    // #############################################################################################
    // #################### Comment this out if you need to test Captioning mode ###################
    // #############################################################################################
    useEffect(() => {
        const cues = [] as CueDto[];
        for(let idx = 0; idx < 9999; idx++) {
            cues.push({
                vttCue: new VTTCue(idx * 3, (idx + 1) * 3, `<i>Source <b>Line</b></i> ${idx + 1}\nWrapped text`),
                cueCategory: "DIALOGUE"
            });
        }
        setTimeout( // this simulates latency caused by server roundtrip

            () => dispatch(updateSourceCues(cues)),
            500
        );
    });
    // #############################################################################################

    useEffect(() => {
        setTimeout( // this simulates latency caused by server roundtrip
            () => dispatch(updateEditingTrack({
                type: "TRANSLATION",
                // type: "CAPTION", // ** Change track type to CAPTION
                language: { id: "en-US", name: "English (US)" } as Language,
                default: true,
                mediaTitle: "This is the video title",
                mediaLength: 4250,
                progress: 50
            })),
            500
        );
    });
    useEffect(() => {
        const cues = [] as CueDto[];
        for(let idx = 0; idx < 9999; idx++) {
            cues.push({
                vttCue: new VTTCue(idx * 3, (idx + 1) * 3, `<i>Editing <b>Line</b></i> ${idx + 1}\nWrapped text`),
                cueCategory: "DIALOGUE"
            });
        }
        setTimeout( // this simulates latency caused by server roundtrip
           () => dispatch(updateCues(cues)),
           500
       );
    });
    // useEffect(() => {
    //     setTimeout( // this simulates latency caused by server roundtrip
    //         () => dispatch(updateCues([])),
    //         500
    //     );
    // });
    useEffect(() => {
        setTimeout( // this simulates latency caused by server roundtrip
            () => dispatch(updateTask({
               type: "TASK_CAPTION",
               projectName: "Project One",
               dueDate: "2019/12/30 10:00AM"
            })),
            500
        );
    });
    useEffect(() => {
        setTimeout( // this simulates latency caused by server roundtrip
            () => dispatch(readSubtitleSpecification({
                subtitleSpecificationId: "3f458b11-2996-41f5-8f22-0114c7bc84db",
                projectId: "68ed2f59-c5c3-4956-823b-d1f9f26585fb",
                enabled: true,
                audioDescription: false,
                onScreenText: true,
                spokenAudio: false,
                speakerIdentification: "NUMBERED",
                dialogueStyle: "DOUBLE_CHEVRON",
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 30,
                minCaptionDurationInMillis: 500,
                maxCaptionDurationInMillis: 4000,
                comments: "Note",
                mediaNotes: "Media notes"
            })),
            500
        );
    });

    return (
        <SubtitleEdit
            poster="http://dotsub-media-encoded.s3.amazonaws.com/media/4/7/thumb.jpg"
            mp4="http://dotsub-media-encoded.s3.amazonaws.com/1/14/14.mp4"
            onViewAllTracks={(): void => undefined}
            onSave={(): void => {
                setTimeout(
                    () => {
                        dispatch(setAutoSaveSuccess(true));
                    }, 500
                );
                return;
            }}
            onComplete={(): void => undefined}
        />
    );
};

ReactDOM.render(
    <Provider store={testingStore}>
        <TestApp />
    </Provider>,
    document.getElementById("root")
);
