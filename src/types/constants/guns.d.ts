export interface GunAmmo {
    capacity: number;
    reload: number;
    store: number;
    pickup: number;
}

export type Gun = {
    ammo: GunAmmo;

    longReloadTime: number;
    shortReloadTime: number;

    weaponName: string;
    internalName: string;
    standardMeshName: string;

    damage: number;
    range: number;
    recoil: number;
    rof: number;
    totalDamage: number;
    velocity: number;
}

export declare const EggK47: Gun;
export declare const DozenGauge: Gun;
export declare const CSG1: Gun;
export declare const Cluck9mm: Gun;
export declare const RPEGG: Gun;
export declare const SMG: Gun;
export declare const M24: Gun;
export declare const AUG: Gun;

export type CreatedGun = Gun & {
    ammo: {
        rounds: number;
        storeMax: number;
    }
};