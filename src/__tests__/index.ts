import { ICheckersModule, initialize } from "../index";

describe("wasm-checkers", () => {
    let m: ICheckersModule;

    beforeAll(async () => {
        m = await initialize();
    });

    it("adds two numbers and returns the expected result", () => {
        expect(m.addTwoNumbers(1, 2)).toBe(3);
    });
});
