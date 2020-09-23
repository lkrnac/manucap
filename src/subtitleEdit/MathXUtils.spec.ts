import { myltiply } from "./MathXUtils";

describe("MathXutils.multiply", () => {

    it("multiply 2 numbers", () => {
        const x = myltiply(3, 2);
        expect(x).toEqual(6);
    });

});
