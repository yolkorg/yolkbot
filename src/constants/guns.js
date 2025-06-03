const Gun = class {
    constructor() {
        this.highPrecision = false;
        this.accuracy = this.constructor.accuracyMax;
        this.shootingAccuracy = this.constructor.accuracyMax;
        this.movementAccuracy = this.constructor.accuracyMax;
        this.accuracyMax = this.constructor.accuracyMax;
        this.accuracyMin = this.constructor.accuracyMin;
        this.accuracyLoss = this.constructor.accuracyLoss;
        this.accuracyRecover = this.constructor.accuracyRecover;
        this.tracer = 0;
        this.adsMod = this.constructor.adsMod || 0.5;
        this.movementAccuracyMod = this.constructor.movementAccuracyMod || 1;
        this.reloadBloom = true;
        this.reloadTimeMod = this.constructor.reloadTimeMod || 1;
    }
};

// eggk47
const Eggk47 = class _Eggk47 extends Gun {
    constructor() {
        super();

        this.ammo = {
            rounds: 30,
            capacity: 30,
            reload: 30,
            store: 240,
            storeMax: 240,
            pickup: 30
        };

        this.longReloadTime = 205;
        this.shortReloadTime = 160;

        this.weaponName = 'EggK-47';
        this.internalName = 'Eggk47';
        this.standardMeshName = 'eggk47';

        this.rof = 3;
        this.recoil = 7;
        this.automatic = true;
        this.damage = 30;
        this.totalDamage = 30;
        this.range = 20;
        this.velocity = 1.5;
        this.tracer = 1;
    }
};

// p90 / scrambler
const DozenGauge = class _DozenGauge extends Gun {
    constructor() {
        super();

        this.ammo = {
            rounds: 2,
            capacity: 2,
            reload: 2,
            store: 24,
            storeMax: 24,
            pickup: 8
        };

        this.longReloadTime = 155;
        this.shortReloadTime = 155;

        this.weaponName = 'Scrambler';
        this.internalName = 'Dozen Gauge';
        this.standardMeshName = 'dozenGauge';

        this.rof = 8;
        this.recoil = 10;
        this.automatic = false;
        this.range = 8;
        this.velocity = 1;
        this.tracer = 0;
        this.damage = 8.5;
        this.accuracyMax = 0.13;
        this.accuracyMin = 0.16;
        this.accuracyLoss = 0.17;
        this.accuracyRecover = 0.02;
        this.totalDamage = 170;
        this.adsMod = 0.6;
        this.movementAccuracyMod = 0.2;
    }
};

// free ranger
const CSG1 = class _CSG1 extends Gun {
    constructor() {
        super();

        this.ammo = {
            rounds: 15,
            // Number of rounds currently loaded
            capacity: 15,
            // Magazine capacity
            reload: 15,
            // Number of rounds added per reload
            store: 60,
            // Number of rounds player is carrying for this weapon
            storeMax: 60,
            // Maximum number of rounds player can carry
            pickup: 15
            // Number of rounds added for each ammo drop collected
        };

        this.hasScope = true;
        this.longReloadTime = 225;
        this.shortReloadTime = 165;
        this.highPrecision = true;

        this.weaponName = 'Free Ranger';
        this.internalName = 'CSG-1';
        this.standardMeshName = 'csg1';

        this.rof = 13;
        this.recoil = 13;
        this.automatic = false;
        this.damage = 110;
        this.totalDamage = 110;
        this.range = 50;
        this.velocity = 1.75;
        this.tracer = 0;

        this.damage = 105;
        this.accuracyMax = 4e-3;
        this.accuracyMin = 0.3;
        this.accuracyLoss = 0.3;
        this.accuracyRecover = 0.025;
        this.totalDamage = 105;
    }
};

// secondary / 9mm
const Cluck9mm = class _Cluck9mm extends Gun {
    constructor() {
        super();

        this.ammo = {
            rounds: 15,
            capacity: 15,
            reload: 15,
            store: 60,
            storeMax: 60,
            pickup: 15
        };

        this.longReloadTime = 195;
        this.shortReloadTime = 160;

        this.weaponName = 'Cluck 9mm';
        this.internalName = 'Cluck 9mm';
        this.standardMeshName = 'cluck9mm';

        this.rof = 4;
        this.recoil = 6;
        this.automatic = false;
        this.damage = 25;
        this.totalDamage = 25;
        this.range = 15;
        this.velocity = 1;
        this.tracer = 0;

        this.damage = 26;
        this.accuracyMax = 0.035;
        this.accuracyMin = 0.15;
        this.accuracyLoss = 0.09;
        this.accuracyRecover = 0.08;
        this.totalDamage = 26;
        this.adsMod = 0.8;
        this.movementAccuracyMod = 0.6;
    }
};

// rpegg / rpg
const RPEGG = class _RPEGG extends Gun {
    constructor() {
        super();

        this.ammo = {
            rounds: 1,
            capacity: 1,
            reload: 1,
            store: 3,
            storeMax: 3,
            pickup: 1
        };

        this.hasScope = true;
        this.longReloadTime = 170;
        this.shortReloadTime = 170;

        this.weaponName = 'RPEGG';
        this.internalName = 'Eggsploder';
        this.standardMeshName = 'rpegg';

        this.rof = 40;
        this.recoil = 60;
        this.automatic = false;
        this.damage = 140;
        this.radius = 2.75;
        this.totalDamage = 140 * 2.75 * 0.5;
        this.range = 45;
        this.minRange = 3;
        this.velocity = 0.4;

        this.accuracyMax = 0.015;
        this.accuracyMin = 0.3;
        this.accuracyLoss = 0.3;
        this.accuracyRecover = 0.02;
        this.absoluteMinAccuracy = 0.3;
    }
};

// whipper
const SMG = class _SMG extends Gun {
    constructor() {
        super();

        this.ammo = {
            rounds: 40,
            capacity: 40,
            reload: 40,
            store: 200,
            storeMax: 200,
            pickup: 40
        };

        this.longReloadTime = 225;
        this.shortReloadTime = 190;

        this.weaponName = 'Whipper';
        this.internalName = 'SMEGG';
        this.standardMeshName = 'smg';

        this.rof = 10;
        this.recoil = 7;
        this.automatic = true;
        this.damage = 15;
        this.totalDamage = 15;
        this.range = 20;
        this.velocity = 1.25;
        this.tracer = 2;

        this.damage = 23;
        this.accuracyMax = 0.06;
        this.accuracyMin = 0.19;
        this.accuracyLoss = 0.045;
        this.accuracyRecover = 0.05;
        this.totalDamage = 23;
        this.adsMod = 0.6;
        this.movementAccuracyMod = 0.7;
    }
};

// crackshot
const M24 = class _M24 extends Gun {
    constructor() {
        super();

        this.ammo = {
            rounds: 1,
            capacity: 1,
            reload: 1,
            store: 12,
            storeMax: 12,
            pickup: 4
        };

        this.hasScope = true;
        this.longReloadTime = 144;
        this.shortReloadTime = 144;

        this.weaponName = 'Crackshot';
        this.internalName = 'M2DZ';
        this.standardMeshName = 'm24';

        this.rof = 60;
        this.recoil = 40;
        this.automatic = false;
        this.damage = 170;
        this.totalDamage = 170;
        this.range = 60;
        this.velocity = 2;
        this.tracer = 0;

        this.damage = 170;
        this.accuracyMax = 0;
        this.accuracyMin = 0.35;
        this.accuracyLoss = 0.1;
        this.accuracyRecover = 0.023;
        this.totalDamage = 170;
        this.movementAccuracyMod = 0.85;
        this.reloadBloom = false;
        this.reloadTimeMod = 0.8;
    }
};

// trihard / tri-hard
const AUG = class _AUG extends Gun {
    constructor() {
        super();

        this.ammo = {
            rounds: 24,
            capacity: 24,
            reload: 24,
            store: 150,
            storeMax: 150,
            pickup: 24
        };

        this.longReloadTime = 205;
        this.shortReloadTime = 160;

        this.weaponName = 'Tri-Hard';
        this.internalName = 'AUG';
        this.standardMeshName = 'aug';

        this.rof = 15;
        this.recoil = 18;
        this.automatic = false;
        this.movementInstability = 2;
        this.damage = 20;
        this.totalDamage = 20;
        this.range = 20;
        this.velocity = 1.5;
        this.tracer = 0;
        this.burst = 3;
        this.burstRof = 1800 / 600;

        this.damage = 35;
        this.accuracyMax = 0.03;
        this.accuracyMin = 0.15;
        this.accuracyLoss = 0.04;
        this.accuracyRecover = 0.03;
        this.totalDamage = 34;
        this.adsMod = 0.6;
        this.movementAccuracyMod = 0.8;
    }
};

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