/* eslint-disable stylistic/max-len */
/*function stringifyCircular(obj) {
    const cache = [];
    return JSON.stringify(obj, (_, value) => {
        if (typeof value === 'object' && value !== null) {

            // Duplicate reference found, discard key
            if (cache.includes(value)) {
                return '* Circular';
            }

            // Store value in our collection
            cache.push(value);
        }
        return value;
    }, 4);
}*/

class NodeList {
    constructor(raw) {
        const now = Date.now();
        this.list = [];
        const addedPositions = {};

        for (const meshName of Object.keys(raw.data)) {
            for (const nodeData of raw.data[meshName]) {
                addedPositions[(
                    (nodeData.x << 16) |
                    (nodeData.y << 8) |
                    (nodeData.z))] = true;
                this.add(new MapNode(meshName, nodeData));
            }
        }

        for (let x = 0; x < raw.width; x++) {
            for (let y = 0; y < raw.height; y++) {
                for (let z = 0; z < raw.depth; z++) {
                    if (!addedPositions[(
                        (x << 16) |
                        (y << 8) |
                        (z)
                    )]) {
                        this.add(new MapNode('SPECIAL.__yolkbot_air__.none', { x: x, y: y, z: z }));
                    }
                }
            }
        }

        const nodeMap = new Map();
        for (const node of this.list) {
            nodeMap.set(node.positionStr(), node);
        }

        for (const node of this.list) {
            const neighbors = [
                { x: node.x + 1, y: node.y, z: node.z },
                { x: node.x - 1, y: node.y, z: node.z },
                { x: node.x, y: node.y + 1, z: node.z },
                { x: node.x, y: node.y - 1, z: node.z },
                { x: node.x, y: node.y, z: node.z + 1 },
                { x: node.x, y: node.y, z: node.z - 1 }
            ];

            for (const neighborPos of neighbors) {
                const neighborKey = `${neighborPos.x},${neighborPos.y},${neighborPos.z}`;
                const neighborNode = nodeMap.get(neighborKey);
                if (neighborNode && node.canLink(neighborNode, this)) {
                    node.addLink(neighborNode);
                }
            }
        }

        console.log(`NodeList created in ${Date.now() - now}ms`);
    }

    add(node) {
        this.list.push(node);
    }

    remove(node) {
        this.list.splice(this.list.indexOf(node), 1);
    }

    at(x, y, z) {
        if (!this.nodeMap) {
            this.nodeMap = new Map();
            for (const node of this.list) {
                const key = `${node.x},${node.y},${node.z}`;
                this.nodeMap.set(key, node);
            }
        }

        const key = `${x},${y},${z}`;
        return this.nodeMap.get(key);
    }

    clean() {
        for (const node of this.list) {
            node.f = 0;
            node.g = 0;
            node.h = 0;
            node.visited = undefined;
            node.parent = undefined;
            node.closed = undefined;
        }
    }

    hasLineOfSight(bot, target) {
        const dx = target.x - bot.x;
        const dy = target.y - bot.y;
        const dz = target.z - bot.z;

        const steps = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));

        const xStep = dx / steps;
        const yStep = dy / steps;
        const zStep = dz / steps;

        let x = bot.x;
        let y = bot.y;
        let z = bot.z;

        for (let i = 0; i <= steps; i++) {
            const node = this.at(Math.round(x), Math.round(y), Math.round(z));
            if (node && node.isSolid()) {
                return false;
            }
            x += xStep;
            y += yStep;
            z += zStep;
        }

        return true;
    }
}

class MapNode {
    constructor(meshType, data) {
        this.x = data.x;
        this.y = data.y;
        this.z = data.z;

        this.position = { x: this.x, y: this.y, z: this.z };
        this.meshType = meshType.split('.').pop();

        this.f = 0;
        this.g = 0;
        this.h = 0;

        this.visited = undefined;
        this.parent = undefined;
        this.closed = undefined;
        this.links = [];

        if (this.isStair()) {
            if (data.ry) {
                this.ry = data.ry;
            } else {
                this.ry = 0;
            }
        }
    }

    addLink(node) {
        this.links.push(node);
    }

    isSolid() {
        return this.meshType == 'full';
    }

    canWalkThrough() {
        return this.meshType == 'none' || this.meshType == 'ladder';
    }

    canWalkOn() {
        return this.meshType == 'full';
    }

    isLadder() {
        return this.meshType == 'ladder';
    }

    isStair() {
        return this.meshType == 'wedge';
    }

    isAir() {
        return this.meshType == 'none';
    }

    canPassThroughOnAllFaces() {
        return this.isAir();
    }

    canLink(node, list) {
        const dx0 = this.x - node.x;
        const dz0 = this.z - node.z;
        const dy0 = this.y - node.y;

        const dx = Math.abs(dx0);
        const dy = Math.abs(dy0);
        const dz = Math.abs(dz0);

        if (dx + dy + dz === 0 || dx + dz > 1 || this.isSolid() || node.isSolid()) {
            return false;
        }

        const belowMe = list.at(this.x, this.y - 1, this.z);
        const belowOther = list.at(node.x, node.y - 1, node.z);

        if (!belowMe || !belowOther) {
            return false;
        }

        const FORWARD_RY_WEDGE_MAPPING = {
            0: { x: 0, z: -1 },
            1: { x: -1, z: 0 },
            2: { x: 0, z: 1 },
            3: { x: 1, z: 0 }
        };

        switch (this.meshType) {
            case 'none':
                if (dy0 === 1 && node.canWalkThrough()) return true;
                if (belowMe.canWalkOn() || belowMe.isLadder()) {
                    if (node.meshType === 'none' || (node.meshType === 'ladder' && dy === 0) || (node.meshType === 'wedge' && dy0 === 0 && dx0 === -FORWARD_RY_WEDGE_MAPPING[node.ry].x && dz0 === -FORWARD_RY_WEDGE_MAPPING[node.ry].z)) {
                        return true;
                    }
                }
                return false;

            case 'ladder':
                if (dy === 1 && node.canWalkThrough()) return true;
                if (dy === 0 && belowMe.canWalkOn()) return true;
                if (node.meshType === 'ladder' && (dy === 1 || (belowMe.canWalkOn() && belowOther.canWalkOn()))) return true;
                return false;

            case 'wedge':
                if (this.x + FORWARD_RY_WEDGE_MAPPING[this.ry].x === node.x && this.z + FORWARD_RY_WEDGE_MAPPING[this.ry].z === node.z && this.y + 1 === node.y) return true;
                if (this.x - FORWARD_RY_WEDGE_MAPPING[this.ry].x === node.x && this.z - FORWARD_RY_WEDGE_MAPPING[this.ry].z === node.z && (this.y === node.y || this.y - 1 === node.y)) return true;
                return false;

            default:
                return false;
        }
    }

    trueCenter() {
        return {
            x: this.x + 0.5,
            y: this.y + 0.5,
            z: this.z + 0.5
        }
    }

    flatCenter() {
        return {
            x: this.x + 0.5,
            y: this.y + 0,
            z: this.z + 0.5
        }
    }

    flatRadialDistance(position) {
        const pos = this.flatCenter();
        return Math.hypot(pos.x - position.x, pos.z - position.z);
    }

    floorCollides(position) {
        const posFloor = Object.entries(position).map(entry => Math.floor(entry[1]));
        return this.x == posFloor[0] && this.y == posFloor[1] && this.z == posFloor[2];
    }

    positionStr() {
        return `${this.x},${this.y},${this.z}`;
    }
}

export default MapNode;

export {
    MapNode,
    NodeList
};