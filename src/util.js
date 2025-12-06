export const createGun = (baseGun) => {
    const gun = structuredClone(baseGun);

    gun.ammo.rounds = gun.ammo.capacity;
    gun.ammo.storeMax = gun.ammo.store;

    return gun;
}

export const fetchMap = async (name, hash) => {
    if (typeof process !== 'undefined') {
        const { existsSync, mkdirSync, readFileSync, writeFileSync } = process.getBuiltinModule('node:fs');
        const { join } = process.getBuiltinModule('node:path');
        const { homedir } = process.getBuiltinModule('node:os');

        const yolkbotCache = join(homedir(), '.yolkbot');
        if (!existsSync(yolkbotCache)) mkdirSync(yolkbotCache);

        const mapCache = join(yolkbotCache, 'maps');
        if (!existsSync(mapCache)) mkdirSync(mapCache);

        const mapFile = join(mapCache, `${name}-${hash}.json`);

        if (existsSync(mapFile)) return JSON.parse(readFileSync(mapFile, 'utf-8'));

        const data = await (await fetch(`https://esm.sh/gh/yolkorg/maps/maps/${name}.json?${hash}`)).json();
        writeFileSync(mapFile, JSON.stringify(data, null, 4), { flag: 'w+' });
        return data;
    }

    const data = await (await fetch(`https://esm.sh/gh/yolkorg/maps/maps/${name}.json?${hash}`)).json();
    return data;
}

export const initKotcZones = (meshData) => {
    const len = meshData.length;
    if (!len) return [];

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < len; i++) {
        const { x, y, z } = meshData[i];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
    }

    const sizeX = (maxX - minX + 1) | 0;
    const sizeY = (maxY - minY + 1) | 0;
    const sizeZ = (maxZ - minZ + 1) | 0;
    const strideY = sizeX;
    const strideZ = sizeX * sizeY;

    const cellIndex = new Int32Array(sizeX * sizeY * sizeZ).fill(-1);
    const zoneIds = new Uint16Array(len);

    const queue = new Uint32Array(len);

    for (let i = 0; i < len; i++) {
        const { x, y, z } = meshData[i];
        cellIndex[((x - minX) | 0) + ((y - minY) | 0) * strideY + ((z - minZ) | 0) * strideZ] = i;
    }

    const zones = [];
    let zoneId = 0;

    const offsets = [-1, strideY, -strideY, strideZ, -strideZ];
    offsets[0] = -1; // x-1
    offsets[1] = 1; // x+1
    offsets[2] = -strideZ; // z-1
    offsets[3] = strideZ; // z+1

    for (let i = 0; i < len; i++) {
        if (zoneIds[i]) continue;

        const zone = ++zoneId;
        const currentZone = [];

        let head = 0, tail = 0;
        queue[tail++] = i;
        zoneIds[i] = zone;

        while (head < tail) {
            const idx = queue[head++];
            const cell = meshData[idx];
            cell.zone = zone;
            currentZone[currentZone.length] = cell;

            const { x, y, z } = cell;
            const flatIdx = ((x - minX) | 0) + ((y - minY) | 0) * strideY + ((z - minZ) | 0) * strideZ;

            let nIdx;

            // x - 1
            if (x > minX && (nIdx = cellIndex[flatIdx - 1]) !== -1 && !zoneIds[nIdx]) {
                zoneIds[nIdx] = zone;
                queue[tail++] = nIdx;
            }
            // x + 1
            if (x < maxX && (nIdx = cellIndex[flatIdx + 1]) !== -1 && !zoneIds[nIdx]) {
                zoneIds[nIdx] = zone;
                queue[tail++] = nIdx;
            }
            // z - 1
            if (z > minZ && (nIdx = cellIndex[flatIdx - strideZ]) !== -1 && !zoneIds[nIdx]) {
                zoneIds[nIdx] = zone;
                queue[tail++] = nIdx;
            }
            // z + 1
            if (z < maxZ && (nIdx = cellIndex[flatIdx + strideZ]) !== -1 && !zoneIds[nIdx]) {
                zoneIds[nIdx] = zone;
                queue[tail++] = nIdx;
            }
        }

        zones[zones.length] = currentZone;
    }

    return zones;
}