import { MapJSON } from './constants/maps';

export declare function fetchMap(name: string, hash: string): Promise<MapJSON>;
export declare function initKotcZones(meshData: Array<{ x: number; y: number; z: number }>): Array<Array<{ x: number; y: number; z: number; zone: number }>>;