import { instantiateModulePromise } from './loader';

export interface ICheckersModule {
    // constants
    BYTES_PER_SQUARE: number,
    SQUARES_PER_ROW: number,
    // functions
    indexForPosition: (x: number, y: number) => number,
    offsetForPosition: (x: number, y: number) => number
}

export const initialize = async () => {
    try {
        const exports = await instantiateModulePromise;
        return exports;
    } catch (err) {
        throw err;
    }
}
