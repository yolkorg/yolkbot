declare class BinaryHeap<T> {
    content: T[];
    scoreFunction: (element: T) => number;
    
    constructor(scoreFunction: (element: T) => number);
    
    push(element: T): void;
    rescoreElement(node: T): void;
    pop(): T;
    remove(node: T): void;
    size(): number;
    bubbleUp(n: number): void;
    includes(n: T): boolean;
    sinkDown(n: number): void;
}

export default BinaryHeap;
export { BinaryHeap };