import { ICheckersModule, initialize } from "../index";

describe("wasm-checkers", () => {
    let m: ICheckersModule;

    beforeAll(async () => {
        m = await initialize();
    });

    describe("indexForPosition", () => {
        it("should be defined", () => {
            expect(m.indexForPosition).toBeDefined();
        });

        it("returns the expected index", () => {
            const iRow = 1;
            const iColumn = 3;
            const iExpected = (iRow + (iColumn * m.SQUARES_PER_ROW));
            expect(m.indexForPosition(iRow, iColumn)).toBe(iExpected);
        });
    });

    describe("offsetForPosition", () => {
        it("should be defined", () => {
            expect(m.offsetForPosition).toBeDefined();
        });

        it("returns the expected index for the starting byte", () => {
            const iRow = 1;
            const iColumn = 3;
            const iExpected = (iRow + (iColumn * m.SQUARES_PER_ROW)) * m.BYTES_PER_SQUARE;
            expect(m.offsetForPosition(iRow, iColumn)).toBe(iExpected);
        });
    });

});
