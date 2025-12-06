import Bot from '../bot';

export type Params = [controlKeys: number | number[]];

export class MovementDispatch {
    inputKeys: number;

    constructor(...args: Params);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default MovementDispatch;