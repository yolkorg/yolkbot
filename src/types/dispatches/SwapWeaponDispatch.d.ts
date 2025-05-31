import Bot from '../bot';

export class SwapWeaponDispatch {
    manualWeapon: 0 | 1;

    constructor(manualWeapon?: 0 | 1);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default SwapWeaponDispatch;