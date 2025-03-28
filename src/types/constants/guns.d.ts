declare class Gun {
    dmgTypeId: number;
    highPrecision: boolean;
    equipTime: number;
    stowWeaponTime: number;
    accuracy: number;
    shootingAccuracy: number;
    movementAccuracy: number;
    accuracyMax: number;
    accuracyMin: number;
    accuracyLoss: number;
    accuracyRecover: number;
    tracer: number;
    burstQueue: number;
    adsMod: number;
    movementAccuracyMod: number;
    reloadBloom: boolean;
    reloadTimeMod: number;
}

declare class Eggk47 extends Gun {
    ammo: {
        rounds: number;
        capacity: number;
        reload: number;
        store: number;
        storeMax: number;
        pickup: number;
    };
    longReloadTime: number;
    shortReloadTime: number;
    weaponName: string;
    internalName: string;
    standardMeshName: string;
    rof: number;
    recoil: number;
    automatic: boolean;
    damage: number;
    totalDamage: number;
    range: number;
    velocity: number;
    tracer: number;
}

declare class DozenGauge extends Gun {
    ammo: {
        rounds: number;
        capacity: number;
        reload: number;
        store: number;
        storeMax: number;
        pickup: number;
    };
    longReloadTime: number;
    shortReloadTime: number;
    weaponName: string;
    internalName: string;
    standardMeshName: string;
    rof: number;
    recoil: number;
    automatic: boolean;
    damage: number;
    totalDamage: number;
    range: number;
    velocity: number;
    tracer: number;
    adsMod: number;
    movementAccuracyMod: number;
}

declare class CSG1 extends Gun {
    ammo: {
        rounds: number;
        capacity: number;
        reload: number;
        store: number;
        storeMax: number;
        pickup: number;
    };
    hasScope: boolean;
    longReloadTime: number;
    shortReloadTime: number;
    highPrecision: boolean;
    weaponName: string;
    internalName: string;
    standardMeshName: string;
    rof: number;
    recoil: number;
    automatic: boolean;
    damage: number;
    totalDamage: number;
    range: number;
    velocity: number;
    tracer: number;
}

declare class Cluck9mm extends Gun {
    ammo: {
        rounds: number;
        capacity: number;
        reload: number;
        store: number;
        storeMax: number;
        pickup: number;
    };
    longReloadTime: number;
    shortReloadTime: number;
    weaponName: string;
    internalName: string;
    standardMeshName: string;
    rof: number;
    recoil: number;
    automatic: boolean;
    damage: number;
    totalDamage: number;
    range: number;
    velocity: number;
    tracer: number;
    adsMod: number;
    movementAccuracyMod: number;
}

declare class RPEGG extends Gun {
    ammo: {
        rounds: number;
        capacity: number;
        reload: number;
        store: number;
        storeMax: number;
        pickup: number;
    };
    hasScope: boolean;
    longReloadTime: number;
    shortReloadTime: number;
    weaponName: string;
    internalName: string;
    standardMeshName: string;
    rof: number;
    recoil: number;
    automatic: boolean;
    damage: number;
    radius: number;
    totalDamage: number;
    range: number;
    minRange: number;
    velocity: number;
    accuracyMax: number;
    accuracyMin: number;
    accuracyLoss: number;
    accuracyRecover: number;
    absoluteMinAccuracy: number;
}

declare class SMG extends Gun {
    ammo: {
        rounds: number;
        capacity: number;
        reload: number;
        store: number;
        storeMax: number;
        pickup: number;
    };
    longReloadTime: number;
    shortReloadTime: number;
    weaponName: string;
    internalName: string;
    standardMeshName: string;
    rof: number;
    recoil: number;
    automatic: boolean;
    damage: number;
    totalDamage: number;
    range: number;
    velocity: number;
    tracer: number;
    adsMod: number;
    movementAccuracyMod: number;
}

declare class M24 extends Gun {
    ammo: {
        rounds: number;
        capacity: number;
        reload: number;
        store: number;
        storeMax: number;
        pickup: number;
    };
    hasScope: boolean;
    longReloadTime: number;
    shortReloadTime: number;
    weaponName: string;
    internalName: string;
    standardMeshName: string;
    rof: number;
    recoil: number;
    automatic: boolean;
    damage: number;
    totalDamage: number;
    range: number;
    velocity: number;
    tracer: number;
    movementAccuracyMod: number;
    reloadBloom: boolean;
    reloadTimeMod: number;
}

declare class AUG extends Gun {
    ammo: {
        rounds: number;
        capacity: number;
        reload: number;
        store: number;
        storeMax: number;
        pickup: number;
    };
    longReloadTime: number;
    shortReloadTime: number;
    weaponName: string;
    internalName: string;
    standardMeshName: string;
    rof: number;
    recoil: number;
    automatic: boolean;
    movementInstability: number;
    damage: number;
    totalDamage: number;
    range: number;
    velocity: number;
    tracer: number;
    burst: number;
    burstRof: number;
    adsMod: number;
    movementAccuracyMod: number;
}

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