import { instantiateModulePromise, isValidModule } from './loader';

type FromGameBoardToByteOffset = (iRow: number, iColumn: number) => number;
type FromBytesToBytes = (piece: number) => number;

/**
 * Exports from a checkers WASM module instance.
 */
export interface ICheckers {
    // constants
    BLACK: number,
    BOARD_COLUMNS: number,
    BOARD_ROWS: number,
    BYTES_PER_SQUARE: number,
    CROWN: number,
    NOT_CROWN: number,
    SQUARES_PER_ROW: number,
    WHITE: number,

    // functions
    crownPiece: (iRow: number, iColumn: number) => void,
    distance: (iRow: number, iColumn: number) => number,
    doMove: (fromX: number, fromY: number, toX: number, toY: number) => number,
    getPiece: (x: number, y: number) => number,
    getTurnOwner: () => number,
    indexForPosition: FromGameBoardToByteOffset,
    inRange: (low: number, high: number, value: number) => number,
    isBlack: FromBytesToBytes,
    initBoard: () => void,
    isCrowned: FromBytesToBytes,
    isPlayersTurn: (player: number) => number,
    isValidMove: (fromX: number, fromY: number, toX: number, toY: number) => number,
    isWhite: FromBytesToBytes,
    move: (fromX: number, fromY: number, toX: number, toY: number) => number,
    offsetForPosition: FromGameBoardToByteOffset,
    setCrown: FromBytesToBytes,
    setPiece: (x: number, y: number, piece: number) => void,
    setTurnOwner: (piece: number) => void;
    shouldCrown: (x: number, y: number) => number;
    toggleTurnOwner: (piece: number) => void;
    unsetCrown: FromBytesToBytes,
    validJumpDistance: (from: number, to: number) => number
}

export const initialize = async () => {
    try {
        const exports = await instantiateModulePromise;
        return exports;
    } catch (err) {
        throw err;
    }
}

export const isValidWasmModule = isValidModule;
