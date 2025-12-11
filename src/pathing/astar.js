export default class AStar {
    constructor(list) {
        this.list = list;
    }

    heuristic(pos1, pos2) {
        const dx = Math.abs(pos1.x - pos2.x);
        const dy = Math.abs(pos1.y - pos2.y);
        const dz = Math.abs(pos1.z - pos2.z);

        const dxz = Math.max(dx, dz);
        return dy + dxz;
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

        const openSet = [start];
        const closedSet = new Set();

        start.h = this.heuristic(start, end);
        start.g = 0;
        start.f = start.h;
        start.visited = true;

        let current;
        while (openSet.length > 0) {
            let lowestIdx = 0;
            let lowestF = openSet[0].f;
            let lowestG = openSet[0].g;

            for (let i = 1; i < openSet.length; i++) {
                const node = openSet[i];
                if (node.f < lowestF || (node.f === lowestF && node.g > lowestG)) {
                    lowestF = node.f;
                    lowestG = node.g;
                    lowestIdx = i;
                }
            }

            current = openSet[lowestIdx];
            if (current === end) return this.reversePath(current);

            openSet[lowestIdx] = openSet[openSet.length - 1];
            openSet.pop();
            closedSet.add(current);

            const neighbors = current.links;
            for (let i = 0; i < neighbors.length; i++) {
                const neighbor = neighbors[i];

                if (closedSet.has(neighbor)) continue;

                const tentativeGScore = current.g + 1;

                if (!neighbor.visited || tentativeGScore < neighbor.g) {
                    const isNew = !neighbor.visited;
                    neighbor.visited = true;
                    neighbor.parent = current;
                    neighbor.g = tentativeGScore;
                    neighbor.h = this.heuristic(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;

                    if (isNew) openSet.push(neighbor);
                }
            }
        }

        return null;
    }
}