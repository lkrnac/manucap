import "./testUtils/initBrowserEnvironment";
import { Provider, useDispatch } from "react-redux";
import React, { ReactElement, useEffect } from "react";
import { updateCues, updateSourceCues } from "./subtitleEdit/cues/cueSlices";
import { updateEditingTrack, updateTask } from "./subtitleEdit/trackSlices";
import { Language } from "./subtitleEdit/model";
import ReactDOM from "react-dom";
import SubtitleEdit from "./subtitleEdit/SubtitleEdit";
import { readSubtitleSpecification } from "./subtitleEdit/toolbox/subtitleSpecificationSlice";
import testingStore from "./testUtils/testingStore";
// Following CSS import has to be after SubtitleEdit import to override Bootstrap defaults
// eslint-disable-next-line sort-imports
import "./localTesting.scss";

const TestApp = (): ReactElement => {
    const dispatch = useDispatch();
    // #############################################################################################
    // #################### Comment this out if you need to test Captioning mode ###################
    // #############################################################################################
    useEffect(() => {
        setTimeout( // this simulates latency caused by server roundtrip
            dispatch(updateSourceCues([
                { vttCue: new VTTCue(0, 1, "<i>Source <b>Line</b></i> 1\nWrapped text"), cueCategory: "DIALOGUE" },
                {
                    vttCue: new VTTCue(1, 2, "<i><lang en>Source</lang> <b>Line</b></i> 2\nWrapped text"),
                    cueCategory: "ONSCREEN_TEXT"
                },
                { vttCue: new VTTCue(2, 3, "<i>Source <b>Line</b></i> 3\nWrapped text"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "<i>Source <b>Line</b></i> 4\nWrapped text"), cueCategory: "DIALOGUE" },
            ])),
            500
        );
    });
    // #############################################################################################

    useEffect(() => {
        setTimeout( // this simulates latency caused by server roundtrip
            dispatch(updateEditingTrack({
                type: "CAPTION",
                language: { id: "en-US", name: "English (US)" } as Language,
                default: true,
                mediaTitle: "This is the video title",
                mediaLength: 4000
            })),
            500
        );
    });
    useEffect(() => {
       setTimeout( // this simulates latency caused by server roundtrip
           dispatch(updateCues([
               { vttCue: new VTTCue(0, 1, "<i>Editing <b>Line</b></i> 1\nWrapped text"), cueCategory: "DIALOGUE" },
               {
                   vttCue: new VTTCue(1, 2, "<i><lang en>Editing</lang> <b>Line</b></i> 2\nWrapped text"),
                   cueCategory: "ONSCREEN_TEXT"
               },
           ])),
           500
       );
    });
    useEffect(() => {
        setTimeout( // this simulates latency caused by server roundtrip
            dispatch(updateTask({
               type: "TASK_CAPTION",
               projectName: "Project One",
               dueDate: "2019/12/30 10:00AM"
            })),
            500
        );
    });
    useEffect(() => {
        setTimeout( // this simulates latency caused by server roundtrip
            dispatch(readSubtitleSpecification({
                subtitleSpecificationId: "3f458b11-2996-41f5-8f22-0114c7bc84db",
                projectId: "68ed2f59-c5c3-4956-823b-d1f9f26585fb",
                enabled: true,
                audioDescription: false,
                onScreenText: true,
                spokenAudio: false,
                speakerIdentification: "NUMBERED",
                dialogueStyle: "DOUBLE_CHEVRON",
                maxLinesPerCaption: 4,
                maxCharactersPerLine: 30,
                minCaptionDurationInMillis: 2000,
                maxCaptionDurationInMillis: 6000,
                comments: "Note"
            })),
            500
        );
    });

    return (
        <SubtitleEdit
            poster="http://dotsub-media-encoded.s3.amazonaws.com/media/4/7/thumb.jpg"
            mp4="http://dotsub-media-encoded.s3.amazonaws.com/1/14/14.mp4"
            onViewAllTracks={(): void => undefined}
            onSave={(): void => undefined}
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
