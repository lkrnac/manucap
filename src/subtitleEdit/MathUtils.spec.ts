import { sum } from "./MathUtils";

describe("Mathutils.add", () => {

    it("add 2 numbers", () => {
        const x = sum(1, 2);
        expect(x).toEqual(3);
    });

});
