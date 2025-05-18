import { Position } from '../bot/GamePlayer';

interface Node {
    position: Position;
    links: Node[];
    visited: boolean;
    parent: Node | null;
    g: number;
    h: number;
    f: number;
}

interface List {
    clean(): void;
}

declare class AStar {
    constructor(list: List);
    list: List;
    heuristic(pos1: Position, pos2: Position): number;
    reversePath(node: Node): Node[];
    path(start: Node, end: Node): Node[] | null;
}

export default AStar;