import { SubtitleSpecification } from "./model";
import deepFreeze from "deep-freeze";
import { readSubtitleSpecification } from "./subtitleSpecificationSlice";
import testingStore from "../testUtils/testingStore";

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
            testingStore.dispatch(readSubtitleSpecification(testingSubtitleSpecification));

            // THEN
            expect(testingStore.getState().subtitleSpecifications).toEqual(testingSubtitleSpecification);
        });
    });
});
