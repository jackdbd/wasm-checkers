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
        it("returns the expected piece", () => {
            const x = 0;
            const y = 0;
            const piece = m.WHITE | m.CROWN;
            m.setPiece(x, y, piece);
            expect(m.getPiece(x, y)).toBe(piece);
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
                m.getPiece(m.BOARD_COLUMNS + 1, m.BOARD_ROWS + 1)
            }).toThrow("unreachable");
        });
    });

    describe("getTurnOwner", () => {
        it("should be defined", () => {
            expect(m.getTurnOwner).toBeDefined();
        });

        it("starts from turn 0", () => {
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
    });

    describe("crownPiece", () => {
        it("should be defined", () => {
            expect(m.crownPiece).toBeDefined();
        });

        it("notifies the host (Node.js) from the wasm module with console.log", () => {
            const spy = jest.spyOn(console, "log");
            m.crownPiece(1, 2);
            expect(spy).toHaveBeenCalledTimes(1);
            spy.mockRestore();
        });
    });

    describe("distance", () => {
        it("returns the expected distance", () => {
            expect(m.distance(1, 6)).toBe(-5);
        });
    });

    describe("shouldCrown", () => {
        it("should be defined", () => {
            expect(m.shouldCrown).toBeDefined();
        });
    });

    describe("isPlayersTurn", () => {
        it("should be defined", () => {
            expect(m.isPlayersTurn).toBeDefined();
        });
    });

    describe("isValidMove", () => {
        it("return a truthy value for a valid move", () => {
            const fromX = 0;
            const fromY = 0;
            const toX = 1;
            const toY = 1;
            m.setPiece(fromX, fromY, m.BLACK);
            expect(m.isValidMove(fromX, fromY, toX, toY)).toBeTruthy();
        });
    });

    describe("doMove", () => {
        it("notifies the host (Node.js) from the wasm module with console.log", () => {
            const spy = jest.spyOn(console, "log");
            m.doMove(0, 0, 1, 1);
            expect(spy).toHaveBeenCalledTimes(1);
            spy.mockRestore();
        });
    });

    describe("validJumpDistance", () => {
        it("allows jumps of 1 or 2 squares", () => {
            expect(m.validJumpDistance(0, 1)).toBeTruthy();
            expect(m.validJumpDistance(0, 2)).toBeTruthy();
        });

        it("does not allow jumps of 3 or more squares", () => {
            expect(m.validJumpDistance(0, 3)).toBeFalsy();
            expect(m.validJumpDistance(0, 4)).toBeFalsy();
        });
    });

    // TODO: add more tests
    describe("move", () => {
        it("should be defined", () => {
            expect(m.move).toBeDefined();
        });
    });

    // TODO: fix these tests. Maybe make a resetBoard function to call beforeEach test.
    describe.skip("initBoard", () => {
        it.skip("sets white pieces at the top and black pieces at the bottom", () => {
            m.initBoard();
            expect(m.getPiece(0, 0)).toBe(0);
            expect(m.getPiece(1, 0)).toBe(m.WHITE);
            expect(m.getPiece(6, 7)).toBe(m.BLACK);
            expect(m.getTurnOwner()).toBe(m.BLACK);
        });

        it.skip("sets the black as the first player", () => {
            m.initBoard();
            expect(m.getTurnOwner()).toBe(m.BLACK);
        });

        it("todo", () => {
            const numPiecesBefore = countPiecesOnBoard(m);
            expect(numPiecesBefore).toBe(0);

            m.initBoard();

            const numPiecesAfter = countPiecesOnBoard(m);
            expect(numPiecesAfter).toBe(0);
        });
    })

});

const countPiecesOnBoard = (m: ICheckers) => {
    const iRows = Array(m.BOARD_ROWS).fill(0).map((_, i) => i);
    const iColumns = Array(m.BOARD_COLUMNS).fill(0).map((_, i) => i);

    let totPieces = 0;
    for (const iColumn of iColumns) {
        for (const iRow of iRows) {
            const p = m.getPiece(iColumn, iRow);
            console.warn(`[${iColumn},${iRow}]: ${p}`);
            if (p === m.BLACK || p === m.WHITE) {
                totPieces = totPieces + 1;
            }
        }
    }

    return totPieces;
}