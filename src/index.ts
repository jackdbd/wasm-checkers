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
    getPiece: (low: number, high: number, value: number) => number,
    getTurnOwner: () => number,
    indexForPosition: FromGameBoardToByteOffset,
    inRange: (low: number, high: number, value: number) => number,
    isBlack: FromBytesToBytes,
    isCrowned: FromBytesToBytes,
    isWhite: FromBytesToBytes,
    offsetForPosition: FromGameBoardToByteOffset,
    setCrown: FromBytesToBytes,
    setPiece: FromGameBoardToByteOffset,
    setTurnOwner: (piece: number) => void;
    toggleTurnOwner: (piece: number) => void;
    unsetCrown: FromBytesToBytes
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
