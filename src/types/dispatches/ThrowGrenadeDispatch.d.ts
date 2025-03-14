import Bot from '../bot';

export class ThrowGrenadeDispatch {
    constructor(power?: number);

    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default ThrowGrenadeDispatch;