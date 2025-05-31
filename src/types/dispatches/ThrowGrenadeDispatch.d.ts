import Bot from '../bot';

export class ThrowGrenadeDispatch {
    power: number;

    constructor(power?: number);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default ThrowGrenadeDispatch;