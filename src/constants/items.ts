import { Position3D } from '../common.d';

export type ItemTypeIds = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ItemTypeNames = 'Hat' | 'Stamp' | 'Primary' | 'Secondary' | 'Melee' | 'Grenade';
export type ClassIds = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type UnlockMethods = 'default' | 'purchase' | 'physical' | 'manual' | 'premium' | 'vip';

export interface Item {
    id: number;
    name: string;
    price: number;
    item_type_id: ItemTypeIds;
    item_type_name: ItemTypeNames;
    exclusive_for_class: ClassIds | null;
    item_data: {
        meshName: string;
        tags: string[];
    };
    is_available: boolean;
    unlock: UnlockMethods;
    align: Position3D;
}

export const Items: Item[] = [];