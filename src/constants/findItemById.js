import { Items } from './items.js';

export const findItemById = (id) => Items.find(item => item.id === id);