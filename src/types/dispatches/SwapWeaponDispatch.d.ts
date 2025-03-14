import Bot from '../bot';

export class SwapWeaponDispatch {
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default SwapWeaponDispatch;