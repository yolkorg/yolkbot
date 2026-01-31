export const GunEquipTime = 13;

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
    rof: number;
    totalDamage: number;
    velocity: number;
}

export type CreatedGun = Gun & {
    ammo: GunAmmo & {
        rounds: number;
        storeMax: number;
    }
};

const EggK47 = {
    ammo: {
        capacity: 30,
        reload: 30,
        store: 240,
        pickup: 30
    },
    longReloadTime: 205,
    shortReloadTime: 160,
    weaponName: 'EggK-47',
    internalName: 'Eggk47',
    standardMeshName: 'eggk47',
    damage: 30,
    range: 20,
    rof: 3,
    totalDamage: 30,
    velocity: 1.5
} as Gun;

const DozenGauge = {
    ammo: {
        capacity: 2,
        reload: 2,
        store: 24,
        pickup: 8
    },
    longReloadTime: 155,
    shortReloadTime: 155,
    weaponName: 'Scrambler',
    internalName: 'Dozen Gauge',
    standardMeshName: 'dozenGauge',
    damage: 8.5,
    range: 8,
    rof: 8,
    totalDamage: 170,
    velocity: 1
} as Gun;

const CSG1 = {
    ammo: {
        capacity: 15,
        reload: 15,
        store: 60,
        pickup: 15
    },
    longReloadTime: 225,
    shortReloadTime: 165,
    weaponName: 'Free Ranger',
    internalName: 'CSG-1',
    standardMeshName: 'csg1',
    damage: 105,
    range: 50,
    rof: 13,
    totalDamage: 105,
    velocity: 1.75
} as Gun;

const Cluck9mm = {
    ammo: {
        capacity: 15,
        reload: 15,
        store: 60,
        pickup: 15
    },
    longReloadTime: 195,
    shortReloadTime: 160,
    weaponName: 'Cluck 9mm',
    internalName: 'Cluck 9mm',
    standardMeshName: 'cluck9mm',
    damage: 26,
    range: 15,
    rof: 4,
    totalDamage: 26,
    velocity: 1
} as Gun;

const RPEGG = {
    ammo: {
        capacity: 1,
        reload: 1,
        store: 3,
        pickup: 1
    },
    longReloadTime: 170,
    shortReloadTime: 170,
    weaponName: 'RPEGG',
    internalName: 'Eggsploder',
    standardMeshName: 'rpegg',
    damage: 140,
    range: 45,
    rof: 40,
    totalDamage: 192.5,
    velocity: 0.4
} as Gun;

const SMG = {
    ammo: {
        capacity: 40,
        reload: 40,
        store: 200,
        pickup: 40
    },
    longReloadTime: 225,
    shortReloadTime: 190,
    weaponName: 'Whipper',
    internalName: 'SMEGG',
    standardMeshName: 'smg',
    damage: 23,
    range: 20,
    rof: 2,
    totalDamage: 23,
    velocity: 1.25
} as Gun;

const M24 = {
    ammo: {
        capacity: 1,
        reload: 1,
        store: 12,
        pickup: 4
    },
    longReloadTime: 144,
    shortReloadTime: 144,
    weaponName: 'Crackshot',
    internalName: 'M2DZ',
    standardMeshName: 'm24',
    damage: 170,
    range: 60,
    rof: 15,
    totalDamage: 170,
    velocity: 2
} as Gun;

const AUG = {
    ammo: {
        capacity: 24,
        reload: 24,
        store: 150,
        pickup: 24
    },
    longReloadTime: 205,
    shortReloadTime: 160,
    weaponName: 'Tri-Hard',
    internalName: 'AUG',
    standardMeshName: 'aug',
    damage: 32,
    range: 20,
    rof: 15,
    totalDamage: 34,
    velocity: 1.5
} as Gun;

export const GunList = [EggK47, DozenGauge, CSG1, RPEGG, SMG, M24, AUG] as const;

export { EggK47, DozenGauge, CSG1, Cluck9mm, RPEGG, SMG, M24, AUG }