import { ICheckers, initialize, isValidWasmModule } from "../index";

describe("wasm-checkers", () => {
    let m: ICheckers;

    beforeAll(async () => {
        m = await initialize();
    });

    describe("isValidWasmModule", () => {
        it("is a valid .wasm module", () => {
            expect(isValidWasmModule()).toBeTruthy();
        });
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

    describe("isCrowned", () => {
        it("should be defined", () => {
            expect(m.isCrowned).toBeDefined();
        });

        it("returns a truthy value for a crowned piece", () => {
            const whiteCrownedPiece = m.WHITE | m.CROWN;
            expect(m.isCrowned(whiteCrownedPiece)).toBeTruthy();
        });

        it("returns a falsy value for an uncrowned piece", () => {
            const whitePiece = m.WHITE;
            expect(m.isCrowned(whitePiece)).toBeFalsy();
        });
    });

    describe("isWhite", () => {
        it("should be defined", () => {
            expect(m.isWhite).toBeDefined();
        });

        it("returns a truthy value for a white piece", () => {
            expect(m.isWhite(m.WHITE)).toBeTruthy();
        });

        it("returns a falsy value for a black piece", () => {
            expect(m.isWhite(m.BLACK)).toBeFalsy();
        });
    });

    describe("isBlack", () => {
        it("should be defined", () => {
            expect(m.isBlack).toBeDefined();
        });

        it("returns a truthy value for a black piece", () => {
            expect(m.isBlack(m.BLACK)).toBeTruthy();
        });

        it("returns a falsy value for a white piece", () => {
            expect(m.isBlack(m.WHITE)).toBeFalsy();
        });
    });

    describe("setCrown", () => {
        it("should be defined", () => {
            expect(m.setCrown).toBeDefined();
        });

        it("should crown a white piece", () => {
            const whitePiece = m.WHITE;
            const whiteCrownedPiece = m.WHITE | m.CROWN;
            expect(m.setCrown(whitePiece)).toBe(whiteCrownedPiece);
        });

        it("should crown a black piece", () => {
            const blackPiece = m.BLACK;
            const blackCrownedPiece = m.BLACK | m.CROWN;
            expect(m.setCrown(blackPiece)).toBe(blackCrownedPiece);
        });

        it("does not alter an already crowned piece", () => {
            const whiteCrownedPiece = m.WHITE | m.CROWN;
            expect(m.setCrown(whiteCrownedPiece)).toBe(whiteCrownedPiece);
        });
    });

    describe("unsetCrown", () => {
        it("should be defined", () => {
            expect(m.unsetCrown).toBeDefined();
        });

        it("should uncrown a crowned white piece", () => {
            const whiteCrownedPiece = m.WHITE | m.CROWN;
            const whitePiece = m.WHITE;
            expect(m.unsetCrown(whiteCrownedPiece)).toBe(whitePiece);
        });

        it("does not alter an already uncrowned piece", () => {
            const whitePiece = m.WHITE;
            expect(m.unsetCrown(whitePiece)).toBe(whitePiece);
        });
    });

    describe("setPiece", () => {
        it("should be defined", () => {
            expect(m.setPiece).toBeDefined();
        });
    });

    describe("getPiece", () => {
        it("should be defined", () => {
            expect(m.getPiece).toBeDefined();
        });
    });

    describe("inRange", () => {
        it("should be defined", () => {
            expect(m.inRange).toBeDefined();
        });

        it("returns truthy for a value in range", () => {
            const value = 5;
            expect(m.inRange(0, 10, value)).toBeTruthy();
        });

        it("returns falsy for a value outside the range", () => {
            const value = 11;
            expect(m.inRange(0, 10, value)).toBeFalsy();
        });

        it("includes both the lower and the upper boundary in the range", () => {
            expect(m.inRange(0, 10, 0)).toBeTruthy();
            expect(m.inRange(0, 10, 10)).toBeTruthy();
        });
    });

    describe("getPiece", () => {
        it("should be defined", () => {
            expect(m.getPiece).toBeDefined();
        });

        it("throws when we exceed the board boundaries", () => {
            expect(() => {
                const piece = 1;
                m.getPiece(m.BOARD_COLUMNS + 1, m.BOARD_ROWS + 1, piece)
            }).toThrow("unreachable");
        });
    });

    describe("getTurnOwner", () => {
        it("should be defined", () => {
            expect(m.getTurnOwner).toBeDefined();
        });

        it("starts from turn 0", () => {
            // console.warn('EXPORTS of the WASM module instance', m);
            expect(m.getTurnOwner()).toBe(0);
        });

        it("keeps track of the current turn owner", () => {
            m.setTurnOwner(1);
            expect(m.getTurnOwner()).toBe(1);
            m.setTurnOwner(2);
            expect(m.getTurnOwner()).toBe(2);
        });
    });

    describe("setTurnOwner", () => {
        it("should be defined", () => {
            expect(m.setTurnOwner).toBeDefined();
        });

        it("sets `piece` as the current turn owner", () => {
            const piece = 1;
            m.setTurnOwner(piece);
            expect(m.getTurnOwner()).toBe(piece);
        });
    });

    describe("toggleTurnOwner", () => {
        it("should be defined", () => {
            expect(m.toggleTurnOwner).toBeDefined();
        });

        it("toggles the turn owner", () => {
            const piece = 1;
            m.setTurnOwner(piece);
            expect(m.getTurnOwner()).toBe(piece);
            m.toggleTurnOwner(piece);
            expect(m.getTurnOwner()).not.toBe(piece);
            m.toggleTurnOwner(piece);
            expect(m.getTurnOwner()).toBe(piece);
        });
    })

});
