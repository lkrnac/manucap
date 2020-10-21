import "video.js"; // VTTCue
import { AnyAction } from "@reduxjs/toolkit";
import { SubtitleSpecification } from "./model";
import deepFreeze from "deep-freeze";
import { readSubtitleSpecification } from "./subtitleSpecificationSlice";
import testingStore from "../../testUtils/testingStore";
import { CueDto } from "../model";
import { updateCues } from "../cues/cuesListActions";

deepFreeze(testingStore.getState());

const testingSubtitleSpecification = {
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
} as SubtitleSpecification;

describe("subtitleSpecificationSlices", () => {
    describe("readSubtitleSpecification", () => {
        it("reads a subtitle specification", () => {
            // WHEN
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().subtitleSpecifications).toEqual(testingSubtitleSpecification);
        });

        it("marks existing cues as corrupted", () => {
            // GIVEN
            const cuesCorrupted = [
                { vttCue: new VTTCue(0, 2, "Caption Long 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 4, "Caption 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(4, 6, "Caption Long Overlapped 3"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(5, 8, "Caption 4"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const testingSubtitleSpecification = {
                maxLinesPerCaption: 2,
                maxCharactersPerLine: 10,
                enabled: true
            } as SubtitleSpecification;
            testingStore.dispatch(updateCues(cuesCorrupted) as {} as AnyAction);

            // WHEN
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification) as {} as AnyAction);

            // THEN
            expect(testingStore.getState().cues[0].corrupted).toBeTruthy();
            expect(testingStore.getState().cues[1].corrupted).toBeFalsy();
            expect(testingStore.getState().cues[2].corrupted).toBeTruthy();
            expect(testingStore.getState().cues[3].corrupted).toBeTruthy();
        });
    });
});
