export interface GunAmmo {
    capacity: number;
    reload: number;
    store: number;
    pickup: number;
}

export interface Gun {
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

declare const EggK47: Gun;
declare const DozenGauge: Gun;
declare const CSG1: Gun;
declare const Cluck9mm: Gun;
declare const RPEGG: Gun;
declare const SMG: Gun;
declare const M24: Gun;
declare const AUG: Gun;

export type AnyGun = EggK47 | DozenGauge | CSG1 | Cluck9mm | RPEGG | SMG | M24 | AUG;

export {
    EggK47,
    DozenGauge,
    CSG1,
    Cluck9mm,
    RPEGG,
    SMG,
    M24,
    AUG
}