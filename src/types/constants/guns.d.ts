export interface GunAmmo {
    rounds: number;
    capacity: number;
    reload: number;
    store: number;
    storeMax: number;
    pickup: number;
}

declare class Gun {
    // base props
    ammo: GunAmmo;

    longReloadTime: number;
    shortReloadTime: number;

    weaponName: string;
    internalName: string;
    standardMeshName: string;

    automatic: boolean;
    damage: number;
    range: number;
    recoil: number;
    rof: number;
    totalDamage: number;
    velocity: number;

    accuracyMin: number;
    accuracyMax: number;
    accuracyLoss: number;
    accuracyRecover: number;

    // optional props
    adsMod: number;
    burst: number;
    burstRof: number;
    movementAccuracyMod: number;
    radius: number;
    reloadBloom: boolean;
    reloadTimeMod: number;
    tracer: number;
}

declare class Eggk47 extends Gun { }
declare class DozenGauge extends Gun { }
declare class CSG1 extends Gun { }
declare class Cluck9mm extends Gun { }
declare class RPEGG extends Gun { }
declare class M24 extends Gun { }
declare class AUG extends Gun { }

export type AnyGun = Eggk47 | DozenGauge | CSG1 | Cluck9mm | RPEGG | SMG | M24 | AUG;

export {
    Eggk47,
    DozenGauge,
    CSG1,
    Cluck9mm,
    RPEGG,
    SMG,
    M24,
    AUG
}