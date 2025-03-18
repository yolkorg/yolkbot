/* eslint-disable stylistic/max-len */
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
                const dx = Math.abs(node.x - other.x);
                const dy = Math.abs(node.y - other.y);
                const dz = Math.abs(node.z - other.z);
                if (dx > 1 || dy > 1 || dz > 1) {
                    continue;
                }
                if (other == this) {
                    continue;
                }
                if (node.canLink(other, this)) {
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

        if (dx + dy + dz == 0) {
            return false;
        }

        if (dx + dz > 1) {
            return false;
        }
        /*
        if (i am solid || target is solid) // can't walk into solid
        -> return false
        if (solid || ladder directly below me) and (solid directly below target) // above solid to above solid
        -> return true
        if (i am ladder && target is ladder && dy == 1 && dx, dz == 0) // up/down ladders
        -> return true
        if (below me is solid && target is wedge && dy == 0 && ry matches) // can walk onto stairs
        -> return true
        if (i am a wedge && dy == 1 && dx/dz matches my ry) // can walk up stairs
        -> return true
        */

        /*
        Wedge rotation data:

        ry | facing
        0  | -z
        1  | -x
        2  | +z
        3  | +x
        */

        const FORWARD_RY_WEDGE_MAPPING = {
            0: { x: 0, z: -1 },
            1: { x: -1, z: 0 },
            2: { x: 0, z: 1 },
            3: { x: 1, z: 0 }
        }

        if ((!this.isStair() && !node.isStair()) && dx + dy + dz > 1) { // if we are more than 1 unit away and no stairs, we can't travel
            return false;
        }

        if (this.isSolid() || node.isSolid()) { // if either of us are impassable, we obviously can't travel between
            return false;
        }

        const belowMe = list.at(this.x, this.y - 1, this.z);
        const belowOther = list.at(node.x, node.y - 1, node.z);

        if (!belowMe || !belowOther) { // if we are at the bottom of the map, we can't travel
            return false;
        }

        switch (this.meshType) {
            // full block
            case 'full':
                return false;

            // usually useless decorations or internal things like spawnpoints
            case 'none':
                if (dy0 == 1 && node.canWalkThrough()) {
                    return true;
                }
                switch (node.meshType) {
                    case 'none':
                        if (belowMe.canWalkOn() || belowMe.isLadder()) {
                            return true;
                        }
                        return false;
                    case 'ladder':
                        if (dy == 0) {
                            if (belowMe.canWalkOn()) {
                                return true;
                            }
                        }
                        return false;
                    case 'wedge':
                        if (dy0 == 0) { // same level
                            if (belowMe.canWalkOn()) {
                                // if the stair is pointing to me
                                if (dx0 == -FORWARD_RY_WEDGE_MAPPING[node.ry].x && dz0 == -FORWARD_RY_WEDGE_MAPPING[node.ry].z) {
                                    return true;
                                }
                                return false;
                            }
                        }
                        return false;
                    case 'aabb':
                        return false;
                    case 'verysoft':
                        return false;

                }
                break;

            case 'ladder':
                if (dy == 1 && node.canWalkThrough()) {
                    return true;
                }
                switch (node.meshType) {
                    case 'none':
                        if (dy == 0) {
                            if (belowMe.canWalkOn()) {
                                return true;
                            }
                        }
                        if (dy == 1) {
                            if (node.canWalkThrough()) {
                                return true;
                            }
                        }
                        return false;
                    case 'ladder':
                        if (dy == 1) {
                            return true;
                        }
                        if (belowMe.canWalkOn() && belowOther.canWalkOn()) {
                            return true;
                        }
                        return false;
                    case 'wedge':
                        return false; // wrong but this should never happen wtf :sob:
                    case 'aabb':
                        return false;
                }
                break;

            // stairs
            case 'wedge':
                // console.log(`I'm a wedge at ${stringifyCircular(this.position)}`)
                /*console.log(`Following the RY mapping, my bottom points to ${this.x - FORWARD_RY_WEDGE_MAPPING[this.ry].x
                }, ${this.y
                }, ${this.z - FORWARD_RY_WEDGE_MAPPING[this.ry].z
                }`)*/
                switch (node.meshType) {
                    case 'none':
                    case 'wedge':
                        // if i'm pointing to it and dy0 = -1, i can walk to it (above)
                        // if i'm reverse pointing and dy0 = 0, i can walk to it (level)
                        // if i'm reverse pointing and dy0 = 1, i can walk to it (below)
                        if (this.x + FORWARD_RY_WEDGE_MAPPING[this.ry].x == node.x && this.z + FORWARD_RY_WEDGE_MAPPING[this.ry].z == node.z) {
                            if (this.y + 1 == node.y) {
                                return true;
                            }
                            return false;
                        }
                        if (this.x - FORWARD_RY_WEDGE_MAPPING[this.ry].x == node.x && this.z - FORWARD_RY_WEDGE_MAPPING[this.ry].z == node.z) {
                            if (this.y == node.y) {
                                return true;
                            }
                            if (this.y - 1 == node.y) {
                                return true;
                            }
                            console.log(`Wedge at ${stringifyCircular(this.position)} can't walk to wedge/air at ${stringifyCircular(node.position)}`);
                            return false;
                        }
                        return false;
                    case 'ladder':
                        return false; // same as above, should never happen
                    case 'aabb':
                    case 'verysoft':
                        return false;
                }
                break;

            // the various random weird shapes, sometimes block most of a block, often can either be walked over or not at all
            case 'aabb':
                return false;

            // things like trees
            case 'verysoft':
                return false;

            // usually an intenral thing? like where the spatula is supposed to go
            case 'oob':
                return false;
        }

        /*if (this.isAir() && node.isAir()) {
            if (dy == 0) {
                if (belowMe.isSolid() || belowMe.isLadder()) {
                    if (belowOther.isSolid()) { // if there is a solid block below both of us, we can travel
                        return true;
                    } else if (belowOther.canWalk()) { // if we can fall off a corner, we can travel
                        return true;
                    } else {
                        return false; // prevent falling multiple blocks (i think?) may not be necessary
                    }
                }
            } else {
                if (dy0 == 1) { // if we are above the other node, we can travel
                    return true;
                }
                return false;
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
 
        if (belowMe.isSolid() && node.isStair() && dy == 0) { // we can walk onto stairs but the stair needs to be pointing to me
            if (dz0 == FORWARD_RY_WEDGE_MAPPING[node.ry].z && dx0 == FORWARD_RY_WEDGE_MAPPING[node.ry].x) {
                return true;
            }
            return false;
        }
 
        if (this.isStair()) {
            if (dx + dz > 1) {
                return false;
            }
            if (dy == 1) { // node is below me
                if (dx0 == FORWARD_RY_WEDGE_MAPPING[this.ry].x && dz0 == FORWARD_RY_WEDGE_MAPPING[this.ry].z) { // if i'm pointing to it
                    const inTheWay = list.at(this.x + FORWARD_RY_WEDGE_MAPPING[this.ry].x, this.y, this.z + FORWARD_RY_WEDGE_MAPPING[this.ry].z);
                    if (inTheWay && inTheWay.isSolid()) {
                        return false;
                    }
                    return true;
                }
                return false;
            } else if (dy == 0) { // node is level with me
                if (dx0 == FORWARD_RY_WEDGE_MAPPING[this.ry].x && dz0 == FORWARD_RY_WEDGE_MAPPING[this.ry].z) { // if i'm pointing to it
                    return true;
                }
                return false;
            } else { // node is above me
                if (dx0 == FORWARD_RY_WEDGE_MAPPING[this.ry].x && dz0 == FORWARD_RY_WEDGE_MAPPING[this.ry].z) { // if i'm pointing to it
                    const inTheWay = list.at(this.x, this.y + 1, this.z);
                    if (inTheWay && inTheWay.isSolid()) {
                        return false;
                    }
                    return true;
                }
                return false;
            }
        }*/
        // console.log('My meshtype, below meshtype: ', this.meshType, belowMe.meshType, 'Other meshtype, below other meshtype: ', node.meshType, belowOther.meshType);
        // console.log('My ry, other ry: ', this.ry, node.ry);
        // console.log('dx0, dy0, dz0: ', dx0, dy0, dz0);
        throw new Error(`Unrecognized node meshType, me: ${stringifyCircular(this)}, other: ${stringifyCircular(node)}, below me: ${stringifyCircular(belowMe)}, below other: ${stringifyCircular(belowOther)}\n\nThis is NOT your fault. This is an internal error related to pathfinding.\nIf you need an immediate fix and don't use pathfinding features, remove the "PATHFINDING" intent.\n\nPlease paste this full error to our support server and **include the map the bot is on**.`);
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