import Bot from '../bot';

export class MovementDispatch {
    inputKeys: number;

    constructor(controlKeys: number | number[]);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default MovementDispatch;