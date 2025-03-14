import Bot from '../bot';

export class MovementDispatch {
    controlKeys: number;

    constructor(controlKeys: number | number[]);

    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default MovementDispatch;