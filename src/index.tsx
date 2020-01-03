import "./testUtils/initBrowserEnvironment";

import "bootstrap/dist/css/bootstrap.min.css";
// import styles from "./styles.css";
import * as React from "react";
import {ReactElement, useEffect} from "react";
import * as ReactDOM from "react-dom";
import {Provider, useDispatch} from "react-redux";
import SubtitleEdit from "./subtitleEdit/SubtitleEdit";
import {updateEditingTrack, updateTask} from "./player/trackSlices";
import {Language, TrackVersion} from "./player/model";
import testingStore from "./testUtils/testingStore";
import {readSubtitleSpecification} from "./toolbox/subtitleSpecificationSlice";

const TestApp = (): ReactElement => {
    const dispatch = useDispatch();
    useEffect(() => {
        setTimeout( // this simulates latency caused by server roundtrip
            dispatch(updateEditingTrack({
                type: "CAPTION",
                language: {id: "en-US", name: "English (US)"} as Language,
                default: true,
                videoTitle: "This is the video title",
                currentVersion: {
                    cues: [
                        new VTTCue(0, 1, "Caption Line 1"),
                        new VTTCue(1, 2, "Caption Line 2"),
                    ]
                } as TrackVersion
            })),
            500
        )
    });
    useEffect(() => {
        setTimeout( // this simulates latency caused by server roundtrip
            dispatch(updateTask({
               type: "TASK_CAPTION",
               projectName: "Project One",
               dueDate: "2019/12/30 10:00AM"
            })),
            500
        )
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
                minCaptionDurationInMillis: 2,
                maxCaptionDurationInMillis: 6,
                comments: "Note"
            })),
            500
        )
    });

    return <SubtitleEdit
        poster="http://dotsub-media-encoded.s3.amazonaws.com/media/4/7/thumb.jpg"
        mp4="http://dotsub-media-encoded.s3.amazonaws.com/1/14/14.mp4"
    />;
};

ReactDOM.render(
    <Provider store={testingStore}>
        <TestApp />
    </Provider>,
    document.getElementById("root")
);
