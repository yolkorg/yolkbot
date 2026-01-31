import { Item, Items } from './items.ts';

const itemsMap = new Map(Items.map(item => [item.id, item]));

export const findItemById = (id: number): Item | undefined => itemsMap.get(id);