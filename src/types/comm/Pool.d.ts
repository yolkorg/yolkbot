declare class Pool<T> {
    size: number;
    originalSize: number;
    constructorFn: () => T;
    objects: Array<T & { id: number; active: boolean }>;
    idx: number;
    numActive: number;

    constructor(constructorFn: () => T, size: number);

    expand(num: number): void;

    retrieve(id?: number): T & { id: number; active: boolean };

    recycle(obj: T & { id: number; active: boolean }): void;

    forEachActive(fn: (obj: T & { id: number; active: boolean }, index: number) => void): void;
}

export default Pool;