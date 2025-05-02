export interface Item {
    id: number;
    name: string;
    price: number;
    item_type_id: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    item_type_name: 'Hat' | 'Stamp' | 'Primary' | 'Secondary' | 'Melee' | 'Grenade';
    exclusive_for_class: null | 0 | 1 | 2 | 3 | 4 | 5 | 6;
    item_data: {
        meshName: string;
        tags: string[];
    };
    is_available: boolean;
    unlock: 'default' | 'purchase' | 'physical' | 'manual' | 'premium' | 'vip';
    align: {
        x: number;
        y: number;
        z: number;
    };
}

export const Items: Item[];