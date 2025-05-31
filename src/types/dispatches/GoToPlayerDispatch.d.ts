import Bot from '../bot';

export declare class GoToPlayerDispatch {
    idOrName: string;

    constructor(idOrName: string);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default GoToPlayerDispatch;