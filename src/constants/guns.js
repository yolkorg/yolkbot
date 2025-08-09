const BaseGun = class {
    constructor() {
        this.adsMod = 0.5;
        this.burst = 0;
        this.burstRof = 0;
        this.movementAccuracyMod = 1;
        this.radius = 0;
        this.reloadBloom = true;
        this.reloadTimeMod = 1;
        this.tracer = 0;
    }
};

// eggk47
const Eggk47 = class _Eggk47 extends BaseGun {
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

        this.automatic = true;
        this.damage = 30;
        this.range = 20;
        this.recoil = 7;
        this.rof = 3;
        this.totalDamage = 30;
        this.velocity = 1.5;

        this.accuracyMin = 0.15;
        this.accuracyMax = 0.03;
        this.accuracyLoss = 0.05;
        this.accuracyRecover = 0.025;

        this.tracer = 1;
    }
};

// p90 / scrambler
const DozenGauge = class _DozenGauge extends BaseGun {
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

        this.automatic = false;
        this.damage = 8.5;
        this.range = 8;
        this.recoil = 10;
        this.rof = 8;
        this.totalDamage = 170;
        this.velocity = 1;

        this.accuracyMin = 0.16;
        this.accuracyMax = 0.13;
        this.accuracyLoss = 0.17;
        this.accuracyRecover = 0.02;

        this.adsMod = 0.6;
        this.movementAccuracyMod = 0.2;
        this.tracer = 0;
    }
};

// free ranger
const CSG1 = class _CSG1 extends BaseGun {
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

        this.longReloadTime = 225;
        this.shortReloadTime = 165;

        this.weaponName = 'Free Ranger';
        this.internalName = 'CSG-1';
        this.standardMeshName = 'csg1';

        this.automatic = false;
        this.damage = 105;
        this.range = 50;
        this.recoil = 13;
        this.rof = 13;
        this.totalDamage = 105;
        this.velocity = 1.75;

        this.accuracyMin = 0.3;
        this.accuracyMax = 0.004;
        this.accuracyLoss = 0.3;
        this.accuracyRecover = 0.025;

        this.tracer = 0;
    }
};

// secondary / 9mm
const Cluck9mm = class _Cluck9mm extends BaseGun {
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

        this.automatic = false;
        this.damage = 26;
        this.range = 15;
        this.recoil = 6;
        this.rof = 4;
        this.totalDamage = 26;
        this.velocity = 1;

        this.accuracyMin = 0.15;
        this.accuracyMax = 0.035;
        this.accuracyLoss = 0.09;
        this.accuracyRecover = 0.08;

        this.adsMod = 0.8;
        this.movementAccuracyMod = 0.6;
        this.tracer = 0;
    }
};

// rpegg / rpg
const RPEGG = class _RPEGG extends BaseGun {
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

        this.longReloadTime = 170;
        this.shortReloadTime = 170;

        this.weaponName = 'RPEGG';
        this.internalName = 'Eggsploder';
        this.standardMeshName = 'rpegg';

        this.automatic = false;
        this.damage = 140;
        this.range = 45;
        this.recoil = 60;
        this.rof = 40;
        this.totalDamage = 192.5;
        this.velocity = 0.4;

        this.accuracyMin = 0.3;
        this.accuracyMax = 0.015;
        this.accuracyLoss = 0.3;
        this.accuracyRecover = 0.02;

        this.radius = 2.75;
    }
};

// whipper
const SMG = class _SMG extends BaseGun {
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

        this.automatic = true;
        this.damage = 23;
        this.range = 20;
        this.recoil = 7;
        this.rof = 2;
        this.totalDamage = 23;
        this.velocity = 1.25;

        this.accuracyMin = 0.19;
        this.accuracyMax = 0.06;
        this.accuracyLoss = 0.045;
        this.accuracyRecover = 0.05;

        this.adsMod = 0.6;
        this.movementAccuracyMod = 0.7;
        this.tracer = 2;
    }
};

// crackshot
const M24 = class _M24 extends BaseGun {
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

        this.longReloadTime = 144;
        this.shortReloadTime = 144;

        this.weaponName = 'Crackshot';
        this.internalName = 'M2DZ';
        this.standardMeshName = 'm24';

        this.automatic = true;
        this.damage = 170;
        this.range = 60;
        this.recoil = 20;
        this.rof = 15;
        this.totalDamage = 170;
        this.velocity = 2;

        this.accuracyMin = 0.35;
        this.accuracyMax = 0;
        this.accuracyLoss = 0.1;
        this.accuracyRecover = 0.023;

        this.movementAccuracyMod = 1.3;
        this.reloadBloom = false;
        this.reloadTimeMod = 0.8;
        this.tracer = 0;
    }
};

// trihard / tri-hard
const AUG = class _AUG extends BaseGun {
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

        this.automatic = false;
        this.damage = 32;
        this.range = 20;
        this.recoil = 18;
        this.rof = 15;
        this.totalDamage = 34;
        this.velocity = 1.5;

        this.accuracyMin = 0.15;
        this.accuracyMax = 0.03;
        this.accuracyLoss = 0.037;
        this.accuracyRecover = 0.03;

        this.adsMod = 0.6;
        this.burst = 3;
        this.burstRof = 3;
        this.movementAccuracyMod = 0.8;
        this.movementInstability = 2;
        this.tracer = 0;
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