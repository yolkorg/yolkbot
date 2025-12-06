import { Zone } from './bot';
import { Position } from './bot/GamePlayer';
import { MapJSON } from './constants/maps';

export declare function createGun<T extends { ammo: { rounds: number; store: any[] } }>(baseGun: T): T;
export declare function fetchMap(name: string, hash: string): Promise<MapJSON>;
export declare function initKotcZones(meshData: Array<Position>): Array<Array<Zone>>;