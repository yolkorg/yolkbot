import { Zone } from './bot';
import { Position } from './bot/GamePlayer';
import { MapJSON } from './constants/maps';

export declare function createGun<T extends { ammo: { capacity: number; store: number } }>(baseGun: T): T;
export declare function createError<T = string>(message: T): { ok: false; error: T };
export declare function fetchMap(name: string, hash: string): Promise<MapJSON>;
export declare function initKotcZones(meshData: Array<Position>): Array<Array<Zone>>;