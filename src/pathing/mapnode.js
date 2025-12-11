const FORWARD_RY_WEDGE_MAPPING = Object.freeze({
    0: { x: 0, z: -1 },
    1: { x: -1, z: 0 },
    2: { x: 0, z: 1 },
    3: { x: 1, z: 0 }
});

const positionKey = (x, y, z) => ((x & 0xFF) << 16) | ((y & 0xFF) << 8) | (z & 0xFF);

class MapNode {
    constructor(meshType, data) {
        this.x = data.x;
        this.y = data.y;
        this.z = data.z;

        this.positionKey = positionKey(this.x, this.y, this.z);
        this.meshType = meshType.split('.').pop();

        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.visited = null;
        this.parent = null;
        this.closed = null;
        this.links = [];
        this._flatCenter = null;

        if (this.meshType === 'wedge') this.ry = data.ry ?? 0;
    }

    isFull() {
        return this.meshType === 'full';
    }

    canWalkThrough() {
        return this.meshType === 'none' || this.meshType === 'ladder';
    }

    canWalkOn() {
        return this.meshType === 'full';
    }

    isLadder() {
        return this.meshType === 'ladder';
    }

    isStair() {
        return this.meshType === 'wedge';
    }

    isAir() {
        return this.meshType === 'none';
    }

    canLink(node, list) {
        const dx0 = this.x - node.x;
        const dz0 = this.z - node.z;
        const dy0 = this.y - node.y;

        const dx = Math.abs(dx0);
        const dy = Math.abs(dy0);
        const dz = Math.abs(dz0);

        if (dx + dy + dz === 0 || (dx + dz > 1 && !((dx === 2 && dz === 1) || (dx === 1 && dz === 2))) || this.isFull() || node.isFull()) return false;

        const belowMe = list.at(this.x, this.y - 1, this.z);
        const belowOther = list.at(node.x, node.y - 1, node.z);
        if (!belowMe || !belowOther) return false;

        // parkour!
        if (dy <= 2 && belowMe.isFull() && belowOther.isFull()) {
            // 2 block jumps
            if ((dx === 2 && dz === 0) || (dx === 0 && dz === 2)) {
                const midX = (this.x + node.x) / 2;
                const midZ = (this.z + node.z) / 2;
                const maxY = Math.max(this.y, node.y);

                const midNode = list.at(midX, maxY, midZ);
                const midBelow = list.at(midX, maxY - 1, midZ);
                const midAbove = list.at(midX, maxY + 1, midZ);

                if (midBelow && midBelow.isAir()) {
                    if (midNode && midNode.isAir() && midAbove && midAbove.isAir()) {
                        const startHead = list.at(this.x, this.y + 1, this.z);
                        const endHead = list.at(node.x, node.y + 1, node.z);
                        if (startHead && startHead.isAir() && endHead && endHead.isAir()) {
                            return true;
                        }
                    }
                }
            }
            // L jumps
            else if ((dx === 2 && dz === 1) || (dx === 1 && dz === 2)) {
                const maxY = Math.max(this.y, node.y);
                const xDir = dx0 > 0 ? -1 : 1;
                const zDir = dz0 > 0 ? -1 : 1;

                const checks = dx === 2 ?
                    [
                        [this.x + xDir, maxY, this.z],
                        [this.x + (2 * xDir), maxY, this.z],
                        [this.x + xDir, maxY, this.z + zDir]
                    ] :
                    [
                        [this.x, maxY, this.z + zDir],
                        [this.x, maxY, this.z + (2 * zDir)],
                        [this.x + xDir, maxY, this.z + zDir]
                    ];

                let allClear = true;
                for (const [x, y, z] of checks) {
                    const block = list.at(x, y, z);
                    const blockBelow = list.at(x, y - 1, z);
                    const blockAbove = list.at(x, y + 1, z);

                    if (!block || !block.isAir() || !blockBelow || !blockBelow.isAir() ||
                        !blockAbove || !blockAbove.isAir()) {
                        allClear = false;
                        break;
                    }
                }

                if (allClear) {
                    const startHead = list.at(this.x, this.y + 1, this.z);
                    const endHead = list.at(node.x, node.y + 1, node.z);
                    if (startHead && startHead.isAir() && endHead && endHead.isAir()) return true;
                }
            }

            if (this.meshType === 'none') {
                if (dy0 === 1 && node.canWalkThrough()) return true;
                if (belowMe.canWalkOn() || belowMe.isLadder()) {
                    if (node.meshType === 'none' || (node.meshType === 'ladder' && dy === 0) || (node.meshType === 'wedge' && dy0 === 0 && dx0 === -FORWARD_RY_WEDGE_MAPPING[node.ry].x && dz0 === -FORWARD_RY_WEDGE_MAPPING[node.ry].z)) return true;
                }
                return false;
            } else if (this.meshType === 'ladder') {
                if (dy === 1 && node.canWalkThrough()) return true;
                if (dy === 0 && belowMe.canWalkOn()) return true;
                return node.meshType === 'ladder' && (dy === 1 || (belowMe.canWalkOn() && belowOther.canWalkOn()));
            } else if (this.meshType === 'wedge') {
                if (!FORWARD_RY_WEDGE_MAPPING[this.ry]) console.log('what the fuck is this ry', this.ry);

                const forward = FORWARD_RY_WEDGE_MAPPING[this.ry];
                const backward = { x: -forward.x, z: -forward.z };

                if (this.x + forward.x === node.x && this.z + forward.z === node.z) {
                    if (this.y + 1 === node.y && node.canWalkThrough()) return true;
                    if (this.y === node.y && node.meshType === 'wedge') return true;
                    if (this.y + 1 === node.y && node.meshType === 'wedge') return true;
                }

                if (this.x + backward.x === node.x && this.z + backward.z === node.z) {
                    if ((this.y === node.y || this.y - 1 === node.y) && node.canWalkThrough()) return true;
                }

                return false;
            }
        }
    }

    flatCenter() {
        if (!this._flatCenter) this._flatCenter = { x: this.x + 0.5, y: this.y, z: this.z + 0.5 };
        return this._flatCenter;
    }

    flatRadialDistance(position) {
        const pos = this.flatCenter();
        return Math.hypot(pos.x - position.x, pos.z - position.z);
    }
}

const NEIGHBOR_OFFSETS = [
    // up/down/L/R
    [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
    // diagonal
    [1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1],
    // stairs
    [1, 1, 0], [-1, 1, 0], [0, 1, 1], [0, 1, -1],
    [1, -1, 0], [-1, -1, 0], [0, -1, 1], [0, -1, -1],
    // parkour 2 block
    [2, 0, 0], [-2, 0, 0], [0, 0, 2], [0, 0, -2],
    [2, 1, 0], [-2, 1, 0], [0, 1, 2], [0, 1, -2],
    [2, -1, 0], [-2, -1, 0], [0, -1, 2], [0, -1, -2],
    [2, 2, 0], [-2, 2, 0], [0, 2, 2], [0, 2, -2],
    [2, -2, 0], [-2, -2, 0], [0, -2, 2], [0, -2, -2],
    // parkour L shape
    [2, 0, 1], [2, 0, -1], [-2, 0, 1], [-2, 0, -1],
    [1, 0, 2], [1, 0, -2], [-1, 0, 2], [-1, 0, -2]
];

class NodeList {
    list = [];
    nodeMap = null;

    constructor(raw) {
        const addedPositions = new Set();

        for (const meshName of Object.keys(raw.data)) {
            for (const nodeData of raw.data[meshName]) {
                addedPositions.add(positionKey(nodeData.x, nodeData.y, nodeData.z));
                this.list.push(new MapNode(meshName, nodeData));
            }
        }

        for (let x = 0; x < raw.width; x++)
            for (let y = 0; y < raw.height; y++)
                for (let z = 0; z < raw.depth; z++)
                    if (!addedPositions.has(positionKey(x, y, z)))
                        this.list.push(new MapNode('SPECIAL.air.none', { x, y, z }));

        this.nodeMap = new Map();
        for (const node of this.list) this.nodeMap.set(node.positionKey, node);

        for (const node of this.list) {
            for (const [dx, dy, dz] of NEIGHBOR_OFFSETS) {
                const neighborKey = positionKey(node.x + dx, node.y + dy, node.z + dz);
                const neighborNode = this.nodeMap.get(neighborKey);
                if (neighborNode && node.canLink(neighborNode, this)) node.links.push(neighborNode);
            }
        }
    }

    at(x, y, z) {
        return this.nodeMap?.get(positionKey(x, y, z));
    }

    atObject({ x, y, z }) {
        return this.nodeMap?.get(positionKey(Math.floor(x), Math.floor(y), Math.floor(z)));
    }

    clean() {
        for (const node of this.list) {
            node.f = 0;
            node.g = 0;
            node.h = 0;
            node.visited = null;
            node.parent = null;
            node.closed = null;
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
            if (node?.isFull()) return false;
            x += xStep;
            y += yStep;
            z += zStep;
        }

        return true;
    }
}

export default MapNode;
export { MapNode, NodeList };