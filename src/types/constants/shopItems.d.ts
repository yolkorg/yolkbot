export interface ShopItem {
    itemIds: number[] | null;
    sku: string;
    name: string;
    price: number;
    salePrice: number | null;
    flagText: string;
    type: 'currency' | 'item' | 'subscription' | 'pass' | 'bundle';
    inStore: number;
    currency: number;
    isActive: boolean;
    id: number;
}

export const ShopItems: ShopItem[];