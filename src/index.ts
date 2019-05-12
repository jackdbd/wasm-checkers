import { instantiateModulePromise } from './loader';

type FromGameBoardToByteOffset = (iRow: number, iColumn: number) => number;
type FromBytesToBytes = (piece: number) => number;

export interface ICheckersModule {
    // constants
    BLACK: number,
    BYTES_PER_SQUARE: number,
    CROWN: number,
    NOT_CROWN: number,
    SQUARES_PER_ROW: number,
    WHITE: number,
    // functions
    getPiece: FromGameBoardToByteOffset,
    indexForPosition: FromGameBoardToByteOffset,
    isBlack: FromBytesToBytes,
    isCrowned: FromBytesToBytes,
    isWhite: FromBytesToBytes,
    offsetForPosition: FromGameBoardToByteOffset,
    setCrown: FromBytesToBytes,
    setPiece: FromGameBoardToByteOffset,
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
