import Bot from '../bot';

export type Params = [manualWeapon?: 0 | 1];

export class SwapWeaponDispatch {
    manualWeapon: 0 | 1;

    constructor(...args: Params);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default SwapWeaponDispatch;