import "./testUtils/initBrowserEnvironment";

// import styles from "./styles.css";
import * as React from "react";
import {ReactElement, useEffect} from "react";
import * as ReactDOM from "react-dom";
import {Provider, useDispatch} from "react-redux";
import SubtitleEdit from "./subtitleEdit/SubtitleEdit";
import {updateEditingTrack} from "./player/trackSlices";
import {Language, TrackDescription, TrackProgress, TrackVersion} from "./player/model";
import testingStore from "./testUtils/testingStore";

const TestApp = (): ReactElement => {
    const dispatch = useDispatch();
    useEffect(() => {
        setTimeout( // this simulates latency caused by server roundtrip
            dispatch(updateEditingTrack({
                type: "CAPTION",
                language: {id: "en-US"} as Language,
                default: true,
                videoTitle: "This is the video title",
                projectName: "Project One",
                dueDate: "2019/12/30 10:00AM",
                description: {action: "Caption in", subject: "English (US)"} as TrackDescription,
                progress: {unit: "115/115 seconds", percentage: "100"} as TrackProgress,
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

