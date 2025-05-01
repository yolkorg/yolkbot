// this is a generic A* pathfinding algorithm implementation

import { BinaryHeap } from './binaryheap.js';

export default class AStar {
    constructor(list) {
        this.list = list;
    }

    heuristic(pos1, pos2) {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y) + Math.abs(pos1.z - pos2.z);
    }

    reversePath(node) {
        const path = [];

        while (node.parent) {
            path.push(node);
            node = node.parent;
        }

        path.reverse();
        return path;
    }

    path(start, end) {
        this.list.clean();

        const heap = new BinaryHeap(node => node.f);
        const closedSet = [];

        start.h = this.heuristic(start, end);
        start.g = 0;
        start.f = start.g + start.h;

        heap.push(start);

        while (heap.size() != 0) {
            const current = heap.pop();

            if (current === end) {
                const val = this.reversePath(current);
                return val;
            }

            closedSet.push(current);

            const neighbors = current.links;

            for (let i = 0; i < neighbors.length; i++) {
                const neighbor = neighbors[i];

                if (closedSet.includes(neighbor)) continue;

                const tentativeGScore = current.g + 1;
                const visited = neighbor.visited;

                if (!visited || tentativeGScore < neighbor.g) {
                    neighbor.visited = true;
                    neighbor.parent = current;
                    neighbor.g = tentativeGScore;
                    neighbor.h = this.heuristic(neighbor.position, end.position);
                    neighbor.f = neighbor.g + neighbor.h;

                    if (!visited) heap.push(neighbor);
                    else heap.rescoreElement(neighbor);
                }
            }
        }

        return null
    }
}