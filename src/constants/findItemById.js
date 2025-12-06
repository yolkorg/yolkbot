import { Items } from './items.js';

const itemsMap = new Map(Items.map(item => [item.id, item]));

export const findItemById = (id) => itemsMap.get(id);