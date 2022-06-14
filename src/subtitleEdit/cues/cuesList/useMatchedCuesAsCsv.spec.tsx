import "../../../testUtils/initBrowserEnvironment";
import { renderHook } from "@testing-library/react-hooks";
import { AnyAction } from "@reduxjs/toolkit";
import { CueDto } from "../../model";
import { updateCues } from "./cuesListActions";
import { createTestingStore } from "../../../testUtils/testingStore";
import { updateSourceCues } from "../view/sourceCueSlices";
import useMatchedCuesAsCsv from "./useMatchedCuesAsCsv";
import { ReactElement } from "react";
import { Provider } from "react-redux";

let testingStore = createTestingStore();

interface WrapperProps {
    children: ReactElement[];
}

describe("useMatchedCuesAsCsv", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    })

    it("returns CSV for exact match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [
            { vttCue: new VTTCue(0, 1, "Target \"Line\" 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source \"Line\" 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "00:00:00.000,00:00:01.000,\"Source \"\"Line\"\" 1\",00:00:00.000,00:00:01.000,\"Target \"\"Line\"\" 1\"\r\n" +
        "00:00:01.000,00:00:02.000,\"Source Line 2\",00:00:01.000,00:00:02.000,\"Target Line 2\"\r\n" +
        "00:00:02.000,00:00:03.000,\"Source Line 3\",00:00:02.000,00:00:03.000,\"Target Line 3\""
        );
    });

    it("returns CSV for 1-n translation match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [
            { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const sourceCues = [
            { vttCue: new VTTCue(0, 3, "Source Line 1"), cueCategory: "DIALOGUE" }
        ] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "00:00:00.000,00:00:03.000,\"Source Line 1\",00:00:00.000,00:00:01.000,\"Target Line 1\"\r\n" +
            "00:00:00.000,00:00:03.000,\"Source Line 1\",00:00:01.000,00:00:02.000,\"Target Line 2\"\r\n" +
            "00:00:00.000,00:00:03.000,\"Source Line 1\",00:00:02.000,00:00:03.000,\"Target Line 3\""
        );
    });

    it("returns CSV for n-1 translation match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [
            { vttCue: new VTTCue(0, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "00:00:00.000,00:00:01.000,\"Source Line 1\",00:00:00.000,00:00:02.000,\"Target Line 1\"\r\n" +
            "00:00:01.000,00:00:02.000,\"Source Line 2\",00:00:00.000,00:00:02.000,\"Target Line 1\"\r\n" +
            "00:00:02.000,00:00:03.000,\"Source Line 3\",00:00:02.000,00:00:03.000,\"Target Line 3\""
        );
    });

    it("returns CSV for 0-n translation match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [
            { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        const sourceCues = [] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            ",,,00:00:00.000,00:00:01.000,\"Target Line 1\"\r\n" +
            ",,,00:00:01.000,00:00:02.000,\"Target Line 2\"\r\n" +
            ",,,00:00:02.000,00:00:03.000,\"Target Line 3\""
        );
    });

    it("returns CSV for n-0 translation match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [] as CueDto[];
        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual(
            "00:00:00.000,00:00:01.000,\"Source Line 1\",,,\r\n" +
            "00:00:01.000,00:00:02.000,\"Source Line 2\",,,\r\n" +
            "00:00:02.000,00:00:03.000,\"Source Line 3\",,,"
        );
    });

    it("returns CSV for no match cues", () => {
        // GIVEN
        const wrapper = ({ children }: WrapperProps): ReactElement => ( // eslint-disable-line react/prop-types
            <Provider store={testingStore}>{children}</Provider>
        );
        const targetCues = [] as CueDto[];
        const sourceCues = [] as CueDto[];

        testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

        // WHEN
        const { result } = renderHook(() => useMatchedCuesAsCsv(), { wrapper });
        const actualCuesCsv = result.current();

        // THEN
        expect(actualCuesCsv).toEqual("");
    });

});
