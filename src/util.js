import { IsBrowser } from './constants/index.js';

export async function fetchMap(name, hash) {
    if (!IsBrowser) {
        const { existsSync, mkdirSync, readFileSync, writeFileSync } = await import('node:fs');
        const { join } = await import('node:path');
        const { homedir } = await import('node:os');

        const yolkbotCache = join(homedir(), '.yolkbot');
        const mapCache = join(yolkbotCache, 'maps');

        if (!existsSync(yolkbotCache)) mkdirSync(yolkbotCache);
        if (!existsSync(mapCache)) mkdirSync(mapCache);

        const mapFile = join(mapCache, `${name}-${hash}.json`);

        if (existsSync(mapFile))
            return JSON.parse(readFileSync(mapFile, 'utf-8'));

        const data = await (await fetch(`https://esm.sh/gh/yolkorg/maps/maps/${name}.json?${hash}`)).json();

        writeFileSync(mapFile, JSON.stringify(data, null, 4), { flag: 'w+' });

        return data;
    } else {
        const data = await (await fetch(`https://esm.sh/gh/yolkorg/maps/maps/${name}.json?${hash}`)).json();
        return data;
    }
}

export function initKotcZones(meshData) {
    let numCaptureZones = 0;
    const mapData = {};
    const zones = [];

    for (const cell of meshData) {
        if (!mapData[cell.x]) mapData[cell.x] = {};
        if (!mapData[cell.x][cell.y]) mapData[cell.x][cell.y] = {};
        mapData[cell.x][cell.y][cell.z] = { zone: null };
    }

    const offsets = [
        { x: -1, z: 0 },
        { x: 1, z: 0 },
        { x: 0, z: -1 },
        { x: 0, z: 1 }
    ];

    function getMapCellAt(x, y, z) {
        return mapData[x] && mapData[x][y] && mapData[x][y][z] ? mapData[x][y][z] : null;
    }

    for (const cellA of meshData) {
        if (!mapData[cellA.x][cellA.y][cellA.z].zone) {
            cellA.zone = ++numCaptureZones;
            mapData[cellA.x][cellA.y][cellA.z].zone = cellA.zone;

            const currentZone = [cellA];
            let hits;

            do {
                hits = 0;
                for (const cellB of meshData) {
                    if (!mapData[cellB.x][cellB.y][cellB.z].zone) {
                        for (const o of offsets) {
                            const cell = getMapCellAt(cellB.x + o.x, cellB.y, cellB.z + o.z);
                            if (cell && cell.zone == cellA.zone) {
                                hits++;
                                cellB.zone = cellA.zone;
                                mapData[cellB.x][cellB.y][cellB.z].zone = cellA.zone;
                                currentZone.push(cellB);
                                break;
                            }
                        }
                    }
                }
            } while (hits > 0);

            zones.push(currentZone);
        }
    }

    return zones;
}