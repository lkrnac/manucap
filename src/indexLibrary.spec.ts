import * as indexLibrary from "./indexLibrary";
import type { CueDto , CueCategory, GlossaryMatchDto } from "./indexLibrary";

describe("indexLibrary", () => {
    it("exports all the necessary actions/reducers", () => {
        // WHEN import of indexLibrary

        // THEN
        expect(indexLibrary.Actions.setAutoSaveSuccess).toBeDefined();
        expect(indexLibrary.Actions.updateCues).toBeDefined();
        expect(indexLibrary.Actions.updateSourceCues).toBeDefined();
        expect(indexLibrary.Actions.updateEditingTrack).toBeDefined();
        expect(indexLibrary.Actions.updateTask).toBeDefined();
        expect(indexLibrary.Reducers).toBeDefined();
    });

    it("exports all the necessary components", () => {
        // WHEN import of indexLibrary

        // THEN
        expect(indexLibrary.SubtitleEdit).toBeDefined();
        expect(indexLibrary.VideoPlayer).toBeDefined();
    });

    it("exports all the necessary types", () => {
        // WHEN type imports of indexLibrary

        // THEN
        expect({} as CueDto).toBeDefined();
        expect({} as CueCategory).toBeDefined();
        expect({} as GlossaryMatchDto).toBeDefined();
    });
});
