import "../../testutils/initBrowserEnvironment.jsx";
import React from "react";
import { assert } from "chai";
import proxyquire from "proxyquire";
import sinon from "sinon";
import { mountWithIntl, removeVideoPlayerDynamicValue } from "../../testutils/testUtils.jsx";
import TagsList from "../../../../main/react/components/common/tags/TagsList.jsx";
import VideoPlayer from "../../../../main/react/components/common/VideoPlayer.jsx";
import organizationStore from "../../../../main/react/store/organizationStore";

const videoJsFake = sinon.stub();
const VideoPlayerProxy = proxyquire(
    "../../../../main/react/components/common/VideoPlayer.jsx", {
        "video.js": videoJsFake,
    }
);

const getVideoJSStubReturn = () => {
    const elStub = sinon.stub();
    elStub.returns({ parentElement: {} });
    const widthStub = sinon.stub();
    widthStub.returns({ height: sinon.stub() });
    const currentSrcStub = sinon.stub();
    currentSrcStub.returns({ });
    const triggerStub = sinon.stub();
    return { watermark: sinon.stub, dotsubCaptions: sinon.stub(), on: sinon.stub(), el: elStub,
        width: widthStub, currentSrc: currentSrcStub, trigger: triggerStub };
};

describe("VideoPlayer", () => {
    it("renders correctly with viewportHeightPerc prop", () => {
        // GIVEN
        const expectedTags = [
            { tagId: "1", name: "tag1", color: "111111", textColor: "000111" },
            { tagId: "3", name: "tag3", color: "333333", textColor: "000333" },
        ];
        const expectedVideoView = mountWithIntl(
            <div>
                <VideoPlayer id="testvpid" poster="dummyPosterUrl" mp4="dummyMp4Url" webm="dummyWebmUrl" />
                <h1 id="mediaTitle">dummyMediaTitle</h1>
                <h3>{"dummyProjectName"} <small>dummyClientName</small></h3>
                <p>mediaDescription</p>
                <p>
                    <TagsList tags={expectedTags} />
                </p>
            </div>
        );

        // WHEN
        const actualVideoView = mountWithIntl(
            <div>
                <VideoPlayer id="testvpid" poster="dummyPosterUrl" mp4="dummyMp4Url"
                    webm="dummyWebmUrl" viewportHeightPerc={0.5}
                />
                <h1 id="mediaTitle">dummyMediaTitle</h1>
                <h3>{"dummyProjectName"} <small>dummyClientName</small></h3>
                <p>mediaDescription</p>
                <p>
                    <TagsList tags={expectedTags} />
                </p>
            </div>
        );

        // THEN
        assert.deepEqual(removeVideoPlayerDynamicValue(actualVideoView.html()),
            removeVideoPlayerDynamicValue(expectedVideoView.html()));
    });

    it("calls captions trigger on videojs player if mediaId not present when captions change", () => {
        // GIVEN
        videoJsFake.reset();
        const videoJsStub = getVideoJSStubReturn();
        videoJsFake.returns(videoJsStub);

        const captions = [
            { content: "The Peach Open Move Project Presents", dialogueType: "DIALOGUE", start: 0, end: 3000,
                horizontalPosition: "CENTER", inlineStyles: [], startOfParagraph: false, verticalPosition: "BOTTOM" }
        ];

        // WHEN
        const actualNode = mountWithIntl(
            <VideoPlayerProxy
                viewportHeightPerc={.5}
                poster="dummyPosterUrl"
                webm="dummyWebmUrl"
            />,
            organizationStore()
        );

        actualNode.setProps({ captions });

        // THEN
        sinon.assert.calledWith(
            videoJsStub.trigger,
            "captions",
            captions
        );
    });

    it("does not call captions trigger on videojs player if mediaId present when captions change", () => {
        // GIVEN
        videoJsFake.reset();
        const videoJsStub = getVideoJSStubReturn();
        videoJsStub.dotsubSelector = sinon.stub();
        videoJsFake.returns(videoJsStub);

        const captions = [
            { content: "The Peach Open Move Project Presents", dialogueType: "DIALOGUE", start: 0, end: 3000,
                horizontalPosition: "CENTER", inlineStyles: [], startOfParagraph: false, verticalPosition: "BOTTOM" }
        ];

        // WHEN
        const actualNode = mountWithIntl(
            <VideoPlayerProxy
                viewportHeightPerc={.5}
                mediaId="testMediaId"
                poster="dummyPosterUrl"
                webm="dummyWebmUrl"
            />,
            organizationStore()
        );

        actualNode.setProps({ captions });

        // THEN
        sinon.assert.notCalled(videoJsStub.trigger);
    });

    it("initializes videoJs with correct playback rates", () => {
        // GIVEN
        videoJsFake.reset();
        const videoJsStub = getVideoJSStubReturn();
        videoJsFake.returns(videoJsStub);
        // WHEN
        mountWithIntl(
            <VideoPlayerProxy
                viewportHeightPerc={.5}
                poster="dummyPosterUrl"
                webm="dummyWebmUrl"
            />,
            organizationStore()
        );

        // THEN
        assert.deepEqual(videoJsFake.getCall(0).args[1].playbackRates, [ 0.5, 0.75, 1, 1.25 ]);
    });
});
