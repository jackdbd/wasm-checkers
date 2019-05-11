import { instantiateModulePromise } from './loader';

type AddToNumbers = (a: number, b: number) => number;

export interface ICheckersModule {
    addTwoNumbers: AddToNumbers
}

export const initialize = async () => {
    try {
        const exports = await instantiateModulePromise;
        return exports;
    } catch (err) {
        throw err;
    }
}
