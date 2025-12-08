import { Position } from '../bot/GamePlayer';

declare class MapNode {
    x: number;
    y: number;
    z: number;
    positionStr: string;
    position: Position;
    meshType: string;
    f: number;
    g: number;
    h: number;
    visited: any | null;
    parent: MapNode | null;
    closed: any | null;
    links: MapNode[];
    ry?: number;

    constructor(meshType: string, data: { x: number; y: number; z: number; ry?: number });

    isFull(): boolean;
    canWalkThrough(): boolean;
    canWalkOn(): boolean;
    isLadder(): boolean;
    isStair(): boolean;
    isAir(): boolean;
    canLink(node: MapNode, list: NodeList): boolean;
    flatCenter(): Position;
    flatRadialDistance(position: Position): number;
}

declare class NodeList {
    list: MapNode[];
    nodeMap?: Map<string, MapNode>;

    constructor(raw: { data: Record<string, Array<{ x: number; y: number; z: number; ry?: number }>>, width: number, height: number, depth: number });

    at(x: number, y: number, z: number): MapNode | undefined;
    clean(): void;
    hasLineOfSight(bot: Position, target: Position): boolean;
}

export default MapNode;
export { MapNode, NodeList };