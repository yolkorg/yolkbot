function stringifyCircular(obj) {
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
}

class NodeList {
    constructor(raw) {
        const now = Date.now();
        this.list = [];

        const addedPositions = [];

        for (const meshName of Object.keys(raw.data)) {
            for (const nodeData of raw.data[meshName]) {
                addedPositions.push(nodeData);
                this.add(new MapNode(meshName, nodeData));
            }
        }

        // data doesn't include air, but we need to include them anyway 
        // addedPositions stores all the blocks with nodes - create a node for every block not in there.
        // width/height/depth are given by raw.width/height/depth
        for (let x = 0; x < raw.width; x++) {
            for (let y = 0; y < raw.height; y++) {
                for (let z = 0; z < raw.depth; z++) {
                    if (!addedPositions.find(node => node.x == x && node.y == y && node.z == z)) {
                        this.add(new MapNode('SPECIAL.fuckitweball.none', { x: x, y: y, z: z }));
                    }
                }
            }
        }

        for (const node of this.list) {
            // add all nodes around it
            for (const other of this.list) {
                if (node.canLink(other, this)) { // this is really fucking slow, but i just want it to work
                    node.addLink(other);
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
        return this.list.find(node => node.x == x && node.y == y && node.z == z);
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
    }

    addLink(node) {
        this.links.push(node);
    }

    isSolid() {
        return this.meshType == 'full';
    }

    canWalk() {
        return this.meshType == 'none' || this.meshType == 'ladder';
    }

    isLadder() {
        return this.meshType == 'ladder';
    }

    isAvoid() {
        return !this.isSolid() && !this.isEmpty();
    }

    canLink(node, list) {
        const dx = Math.abs(this.x - node.x);
        const dy = Math.abs(this.y - node.y);
        const dz = Math.abs(this.z - node.z);
        if (dx + dy + dz != 1) { return false; }

        /*
        if (i am solid || target is solid) // can't walk into solid
        -> return false
        if (solid || ladder directly below me) and (solid directly below target) // above solid to above solid
        -> return true
        if (i am ladder && target is ladder && dy == 1 && dx, dz == 0) // up/down ladders
        -> return true
        */
        if (!this.canWalk() || !node.canWalk()) { // if either of us are impassable, we obviously can't travel between
            return false;
        }

        const belowMe = list.at(this.x, this.y - 1, this.z);
        const belowOther = list.at(node.x, node.y - 1, node.z);

        if (!belowMe || !belowOther) { // if we are at the bottom of the map, we can't travel
            return false;
        }

        if (belowMe.isSolid() || belowMe.isLadder()) {
            if (belowOther.isSolid()) { // if there is a solid block below both of us, we can travel
                return true;
            } else if (belowOther.canWalk()) { // if we can fall off a corner, we can travel
                return true;
            } else {
                return false; // prevent falling multiple blocks (i think?) may not be necessary
            }
        }

        if (!belowMe.isSolid()) {
            if (this.y - node.y == 1) { // i can fall down one node
                return true;
            } else {
                return false; // if there's air beneath me, we can't move side to side
            }
        }

        if (this.isLadder() && node.isLadder() && dy == 1 && dx + dz == 0) { // we can climb up and down ladders
            return true;
        }

        // eslint-disable-next-line stylistic/max-len
        throw new Error(`Erm... what the flip? Likely unrecognized node meshType, me: ${stringifyCircular(this)}, other: ${stringifyCircular(node)}, below me: ${stringifyCircular(belowMe)}, below other: ${stringifyCircular(belowOther)}`);
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
}

export default MapNode;

export {
    MapNode,
    NodeList
};