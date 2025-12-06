import Bot from '../bot';

export type Params = [power?: number];

export class ThrowGrenadeDispatch {
    power: number;

    constructor(...args: Params);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default ThrowGrenadeDispatch;